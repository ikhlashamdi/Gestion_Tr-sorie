// routes/transfertRoutes.js
const express = require("express");
const router = express.Router();
const Transfert = require("../Models/Transfert");
const auth = require("../Middlewares/Auth");
const Caisse = require("../Models/Caisse");
const MvtCaisse = require("../Models/MvtCaisse");
const PDFDocument = require("pdfkit");

// Exemple simple : TRF-YYYYMMDD-HHMMSS
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

    const reference = generateReference(); // ✅ générer la référence

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
      reference // ✅ on enregistre aussi
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


router.get("/", auth, async (req, res) => {
  try {
    let { startDate, endDate, caisse } = req.query;
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

    const transferts = await Transfert.find(filtre)
      .populate("caisseSource", "libelle")
      .populate("caisseDestination", "libelle")
      .populate("utilisateur", "name email societe")
      .sort({ date: -1 });

    res.json(transferts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


// Route pour générer un reçu de transfert de caisse au format PDF
router.get("/:id/pdf", auth, async (req, res) => {
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

    // --- Informations de la Société ---
    doc.fontSize(10).font("Helvetica-Bold").text("Nom de la société :", 50, 70);
    doc.font("Helvetica").text(transfert.utilisateur?.societe || transfert.utilisateur?.email || "Utilisateur inconnu", 130);
    doc.font("Helvetica-Bold").text("Date d'impression :", 50, 115);
    doc.font("Helvetica").text(new Date().toLocaleString('fr-FR'), 150, 115);

    doc.moveTo(50, 130).lineTo(560, 130).stroke();
    doc.moveDown(1);

    // --- Titre du Document ---
    doc.fontSize(20).font("Helvetica-Bold").text("REÇU DE TRANSFERT DE CAISSE", { align: "center" });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Référence du Transfert :", 50);
    doc.font("Helvetica").text(transfert.reference || "N/A", 150);
    doc.moveDown(0.5);


    // --- Détails de la Transaction ---
    doc.fontSize(12).font("Helvetica-Bold").text("Numéro du Reçu :", 50);
    doc.font("Helvetica").text(transfert._id.toString(), 150);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Date et Heure :", 50);
    doc.font("Helvetica").text(new Date(transfert.date).toLocaleString('fr-FR'), 150);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Montant Transféré :", 50);
    doc.fontSize(16).font("Helvetica-Bold").fillColor("green").text(`${transfert.montant.toFixed(3)} DT`, 180);
    doc.fillColor("black"); // Réinitialiser la couleur
    doc.moveDown();

    doc.fontSize(12).font("Helvetica-Bold").text("Motif du Transfert :", 50);
    doc.font("Helvetica").text(transfert.motif, 170);
    doc.moveDown();
    
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(1);

    // --- Parties Impliquées ---
    doc.fontSize(12).font("Helvetica-Bold").text("Caisse Source :", 50);
    doc.font("Helvetica").text(transfert.caisseSource?.libelle, 150);
    doc.moveDown(0.5);
    
    doc.font("Helvetica-Bold").text("Caisse Destination :", 50);
    doc.font("Helvetica").text(transfert.caisseDestination?.libelle, 170);
    doc.moveDown();
    
    doc.font("Helvetica-Bold").text("Réalisé par :", 50);
    // ✅ Correction du bug : utilise "name" au lieu de "nom"
    doc.font("Helvetica").text(transfert.utilisateur?.name || transfert.utilisateur?.email || "Utilisateur inconnu", 130);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(1);

    // --- Approbations ---
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

    // --- Pied de page ---
    doc.fontSize(8).font("Helvetica").text("Ceci est un document généré automatiquement. Veuillez le conserver pour vos dossiers.", { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


module.exports = router;
