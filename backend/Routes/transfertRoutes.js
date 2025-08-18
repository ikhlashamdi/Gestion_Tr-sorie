// routes/transfertRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Caisse = require("../Models/Caisse");
const MvtCaisse = require("../Models/MvtCaisse");
const Transfert = require("../Models/Transfert");
const Notification = require("../Models/Notification");
const PDFDocument = require("pdfkit");
const verifyToken = require("../Middlewares/Auth");

// Fonction utilitaire pour émettre un événement Socket.IO
const emitSocketEvent = (req, eventName, room, data) => {
    const io = req.app.get("io");
    if (io) {
        console.log(`Tentative d'envoi de l'événement '${eventName}' à la pièce : ${room}`);
        io.to(room).emit(eventName, data);
    } else {
        console.error("Socket.IO instance not available.");
    }
};

// Fonction utilitaire pour calculer le temps écoulé
const getTempsEcoule = (date) => {
    const maintenant = new Date();
    const ilYa = new Date(date);
    const differenceEnSecondes = Math.floor((maintenant - ilYa) / 1000);

    const minutes = Math.floor(differenceEnSecondes / 60);
    const heures = Math.floor(minutes / 60);
    const jours = Math.floor(heures / 24);

    if (jours > 0) {
        return `${jours} j`;
    }
    if (heures > 0) {
        return `${heures} h`;
    }
    if (minutes > 0) {
        return `${minutes} min`;
    }
    return `${differenceEnSecondes} s`;
};

// POST /api/transferts/demander
// Crée une nouvelle demande de transfert et une notification pour le destinataire.
router.post('/demander', verifyToken, async (req, res) => {
    const { caisseSource, caisseDestination, montant, motif } = req.body;
    try {
        const source = await Caisse.findById(caisseSource).populate('utilisateur');
        const destination = await Caisse.findById(caisseDestination).populate('utilisateur');
        
        if (!source || !destination) {
            return res.status(404).json({ message: "Caisse source ou destination non trouvée." });
        }

       const reference = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const nouveauTransfert = new Transfert({
            caisseSource: source._id,
            caisseDestination: destination._id,
            montant,
            motif,
            utilisateur: req.user.id,
            reference,
            statut: 'en_attente',
        });

        await nouveauTransfert.save();

        const sourceUserName = source.utilisateur ? source.utilisateur.name : 'Utilisateur inconnu';
        
        if (destination.utilisateur && destination.utilisateur._id) {
            const notification = new Notification({
                user: destination.utilisateur._id,
                message: `Nouvelle demande de transfert de ${nouveauTransfert.montant} DT de la part de ${sourceUserName}.`,
                type: 'demande_transfert',
                relatedId: nouveauTransfert._id,
            });
            await notification.save();
        }

        emitSocketEvent(req, "demande_transfert", destination.utilisateur._id.toString(), {
            transfertId: nouveauTransfert._id,
            montant: nouveauTransfert.montant,
            emetteur: sourceUserName
        });

        // Emettre un événement général de mise à jour de la notification
        if (destination.utilisateur && destination.utilisateur._id) {
            emitSocketEvent(req, "notifications_updated", destination.utilisateur._id.toString());
        }

        res.status(201).json({ message: "Demande de transfert créée.", transfert: nouveauTransfert });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur.", error: err.message });
    }
});

// GET /api/transferts/notifications
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const caisses = await Caisse.find({ utilisateur: userId });
        const caisseIds = caisses.map(c => c._id);
        
        const notifications = await Transfert.find({ 
            caisseDestination: { $in: caisseIds },
            statut: 'en_attente'
        }).populate({
            path: 'caisseSource',
            populate: {
                path: 'utilisateur',
                select: 'name'
            }
        });

        const formattedNotifications = notifications.map(notif => ({
            _id: notif._id,
            montant: notif.montant,
            emetteur: notif.caisseSource.utilisateur.name,
            message: `Nouvelle demande de transfert de ${notif.montant} DT de la part de ${notif.caisseSource.utilisateur.name}.`,
            type: 'demande_transfert',
            // Ajoutez le temps écoulé ici
            tempsEcoule: getTempsEcoule(notif.date)
        }));

        res.json(formattedNotifications);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des notifications.", error: err.message });
    }
});


// POST /api/transferts/accepter/:transfertId
router.post('/accepter/:transfertId', verifyToken, async (req, res) => {
    try {
        const { transfertId } = req.params;
        const transfert = await Transfert.findById(transfertId).populate('caisseSource').populate('caisseDestination');

        if (!transfert) {
            return res.status(404).json({ message: "Transfert non trouvé." });
        }

        if (transfert.statut !== 'en_attente') {
            return res.status(400).json({ message: "Ce transfert n'est pas en attente." });
        }
        
        transfert.statut = 'accepté';
        await transfert.save();

        const source = await Caisse.findById(transfert.caisseSource);
        const destination = await Caisse.findById(transfert.caisseDestination);

        if (!source || !destination) {
            return res.status(404).json({ message: "Caisse source ou destination introuvable." });
        }

        // Mettez à jour les soldes
        source.soldeActuel -= transfert.montant;
        destination.soldeActuel += transfert.montant;

        const mvtSource = new MvtCaisse({
            caisse: source._id,
            typeMouvement: 'decaissement',
            montant: transfert.montant,
            utilisateur: req.user.id,
            description: `Transfert vers ${destination.libelle} (ref: ${transfert.reference})`,
            etat: 'valide'
        });

        const mvtDestination = new MvtCaisse({
            caisse: destination._id,
            typeMouvement: 'encaissement',
            montant: transfert.montant,
            utilisateur: req.user.id,
            description: `Transfert de ${source.libelle} (ref: ${transfert.reference})`,
            etat: 'valide'
        });

        await mvtSource.save();
        await mvtDestination.save();
        await source.save();
        await destination.save();

        // Créez la notification pour l'émetteur du transfert
        const notification = new Notification({
            user: transfert.utilisateur,
            message: `Votre demande de transfert de ${transfert.montant} DT a été acceptée par ${destination.libelle}.`,
            type: 'transfert_accepte',
            relatedId: transfert._id,
        });
        await notification.save();

        // Marquez la notification de demande de transfert comme lue
        await Notification.findOneAndUpdate(
            { relatedId: transfert._id, type: 'demande_transfert' },
            { $set: { read: true } },
            { new: true }
        );


        emitSocketEvent(req, "transfert_accepte", transfert.utilisateur.toString(), {
            transfertId: transfert._id,
            montant: transfert.montant,
            accepteur: destination.libelle
        });

        // Emettre un événement de mise à jour pour l'utilisateur recevant l'acceptation
        if (transfert.utilisateur) {
            emitSocketEvent(req, "notifications_updated", transfert.utilisateur.toString());
        }

        res.json({ message: "Transfert accepté avec succès.", transfert });
    } catch (err) {
        console.error("Erreur dans le endpoint accepter:", err);
        res.status(500).json({ message: "Erreur serveur lors de l'acceptation.", error: err.message });
    }
});

router.post('/annuler/:id', verifyToken, async (req, res) => {
    try {
        const transfert = await Transfert.findById(req.params.id);
        if (!transfert) {
            return res.status(404).json({ message: 'Transfert non trouvé' });
        }

        if (transfert.statut !== 'en_attente') {
            return res.status(400).json({ message: 'Le transfert ne peut pas être annulé car il n\'est pas en attente.' });
        }

        transfert.statut = 'annulé';
        await transfert.save();

        // Marquez la notification de demande de transfert comme lue lors de l'annulation
        await Notification.findOneAndUpdate(
            { relatedId: transfert._id, type: 'demande_transfert' },
            { $set: { read: true } },
            { new: true }
        );

        // Emettre un événement de mise à jour pour l'utilisateur émetteur
        if (transfert.utilisateur) {
            emitSocketEvent(req, "notifications_updated", transfert.utilisateur.toString());
        }

        res.status(200).json({ message: 'Transfert annulé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const generateReference = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `TRF-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

router.post("/", async (req, res) => {
    try {
        let { caisseSource, caisseDestination, montant, motif, utilisateur } = req.body;
        montant = parseFloat(montant);

        if (isNaN(montant) || montant <= 0) {
            return res.status(400).json({ message: "Le montant doit être positif." });
        }

        if (caisseSource === caisseDestination) {
            return res.status(400).json({ message: "Les caisses doivent être différentes." });
        }

        const source = await Caisse.findById(caisseSource);
        const destination = await Caisse.findById(caisseDestination);
        if (!source || !destination) return res.status(404).json({ message: "Caisse introuvable." });

        if (source.soldeActuel < montant) {
            return res.status(400).json({ message: "Solde insuffisant." });
        }

        const reference = generateReference();

        const mvtSource = new MvtCaisse({
            caisse: caisseSource,
            typeMouvement: "decaissement",
            montant,
            utilisateur,
            description: `Transfert vers ${destination.libelle} : ${motif}`,
            etat: "valide"
        });

        const mvtDestination = new MvtCaisse({
            caisse: caisseDestination,
            typeMouvement: "encaissement",
            montant,
            utilisateur,
            description: `Transfert de ${source.libelle} : ${motif}`,
            etat: "valide"
        });

        const newTransfert = new Transfert({
            caisseSource,
            caisseDestination,
            montant,
            motif,
            utilisateur,
            reference
        });

        source.soldeActuel -= montant;
        destination.soldeActuel += montant;

        await newTransfert.save();
        await mvtSource.save();
        await mvtDestination.save();
        await source.save();
        await destination.save();

        res.status(201).json({ message: "Transfert effectué avec succès.", reference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});


router.get("/", verifyToken, async (req, res) => {
    try {
        // 1. Récupération des paramètres de requête
        const { page, pageSize, startDate, endDate, caisse, statut } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limit = parseInt(pageSize, 10) || 10;
        const skip = (pageNumber - 1) * limit;

        // 2. Création de l'objet de filtre
        let filtre = {};

        if (startDate && endDate) {
            filtre.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        if (caisse) {
            filtre.$or = [
                { caisseSource: caisse },
                { caisseDestination: caisse }
            ];
        }

         if (statut && statut !== 'Toutes les caisses') {
            filtre.statut = statut;
        }
        // 3. Compter le nombre total de transferts correspondant aux filtres
        const totalCount = await Transfert.countDocuments(filtre);

        // 4. Récupération des transferts paginés
        const transferts = await Transfert.find(filtre)
            .populate("caisseSource", "libelle")
            .populate("caisseDestination", "libelle")
            .populate("utilisateur", "name email societe")
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // 5. Envoi de la réponse avec les données paginées et le total
        res.json({
            transferts: transferts,
            total: totalCount,
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


router.get("/:id/pdf", verifyToken, async (req, res) => {
    try {
        const transfert = await Transfert.findById(req.params.id)
            .populate("caisseSource", "libelle")
            .populate("caisseDestination", "libelle")
            .populate("utilisateur", "name email societe");

        if (!transfert) return res.status(404).send("Transfert introuvable");

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=transfert_${transfert._id}.pdf`);

        doc.pipe(res);

        doc.fontSize(10).font("Helvetica-Bold").text("Nom de la société :", 50, 70);
        doc.font("Helvetica").text(transfert.utilisateur?.societe || transfert.utilisateur?.email || "Utilisateur inconnu", 130);
        doc.font("Helvetica-Bold").text("Date d'impression :", 50, 115);
        doc.font("Helvetica").text(new Date().toLocaleString('fr-FR'), 150, 115);

        doc.moveTo(50, 130).lineTo(560, 130).stroke();
        doc.moveDown(1);

        doc.fontSize(20).font("Helvetica-Bold").text("REÇU DE TRANSFERT DE CAISSE", { align: "center" });
        doc.moveDown();

        doc.font("Helvetica-Bold").text("Référence du Transfert :", 50);
        doc.font("Helvetica").text(transfert.reference || "N/A", 150);
        doc.moveDown(0.5);

        doc.fontSize(12).font("Helvetica-Bold").text("Numéro du Reçu :", 50);
        doc.font("Helvetica").text(transfert._id.toString(), 150);
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").text("Date et Heure :", 50);
        doc.font("Helvetica").text(new Date(transfert.date).toLocaleString('fr-FR'), 150);
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").text("Montant Transféré :", 50);
        doc.fontSize(16).font("Helvetica-Bold").fillColor("green").text(`${transfert.montant.toFixed(3)} DT`, 180);
        doc.fillColor("black");
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").text("Motif du Transfert :", 50);
        doc.font("Helvetica").text(transfert.motif, 170);
        doc.moveDown();
        
        doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
        doc.moveDown(1);

        doc.fontSize(12).font("Helvetica-Bold").text("Caisse Source :", 50);
        doc.font("Helvetica").text(transfert.caisseSource?.libelle, 150);
        doc.moveDown(0.5);
        
        doc.font("Helvetica-Bold").text("Caisse Destination :", 50);
        doc.font("Helvetica").text(transfert.caisseDestination?.libelle, 170);
        doc.moveDown();
        
        doc.font("Helvetica-Bold").text("Réalisé par :", 50);
        doc.font("Helvetica").text(transfert.utilisateur?.name || transfert.utilisateur?.email || "Utilisateur inconnu", 130);
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
        doc.moveDown(1);

        doc.fontSize(12).font("Helvetica-Bold").text("Approbations", { align: "center" });
        doc.moveDown();

        doc.text("Signature de la Caisse Source", 50, doc.y, { align: "left" });
        doc.text("Signature de la Caisse de Destination", 350, doc.y, { align: "left" });
        doc.moveDown(3);

        doc.font("Helvetica-Bold").text("Nom :", 50, doc.y, { align: "left" });
        doc.font("Helvetica").text("..................................", 85, doc.y);
        doc.font("Helvetica-Bold").text("Nom :", 350, doc.y, { align: "left" });
        doc.font("Helvetica").text("..................................", 385, doc.y);
        doc.moveDown();
        
        doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(8).font("Helvetica").text("Ceci est un document généré automatiquement. Veuillez le conserver pour vos dossiers.", { align: "center" });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});


module.exports = router;
