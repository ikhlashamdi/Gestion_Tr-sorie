const mongoose = require("mongoose");
const express = require('express');
const Caisse = require('../Models/Caisse');
const User = require('../Models/User')
const router = express.Router();
const MvtCaisse = require("../Models/MvtCaisse");


const verifyToken = require("../Middlewares/Auth"); 
const checkRole = require("../Middlewares/roleMiddleware"); 

router.get("/by-user/:userId", verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
    try {
        const userId = req.params.userId;

        // 1. Vérification des permissions
        const userRole = req.user.role;
        // Récupère les IDs des sociétés de l'utilisateur connecté
        const userSocietesIds = req.user.societes ? req.user.societes.map(s => s._id.toString()) : [];
        
        // CHECK CAISSIER: Un caissier ne peut voir que SES PROPRES caisses via cette route
        if (userRole === 'caissier' && req.user._id.toString() !== userId.toString()) {
             return res.status(403).json({ message: "Accès refusé. En tant que caissier, vous ne pouvez consulter que vos propres caisses via cet endpoint." });
        }

        // Initialisation de la requête MongoDB
        let query = { utilisateur: userId };
        
        // CHECK RESPONSABLE: Un responsable peut uniquement voir les caisses d'utilisateurs appartenant à ses sociétés.
        if (userRole === 'responsable') {
            if (userSocietesIds.length === 0) {
                return res.status(403).json({ message: "Accès refusé. Vous n'êtes responsable d'aucune société." });
            }
            // Ajoute un filtre pour que la caisse appartienne à l'une des sociétés du responsable
            query.societe = { $in: userSocietesIds };
        } 
        
        // 2. Vérification de l'existence de l'utilisateur (bonne pratique)
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "Utilisateur cible non trouvé." });
        }

        // 3. Récupération des caisses
        const caisses = await Caisse.find(query)
            .populate("utilisateur", "name role") // Peupler l'utilisateur assigné
            .populate("societe", "name")         // Peupler la société
            .select("-__v");                     // Exclure le champ de version

        res.status(200).send(caisses);

    } catch (err) {
        console.error("❌ Erreur API /by-user:", err);
        // Gestion de l'erreur si l'ID n'est pas un ObjectId valide
        if (err instanceof mongoose.Error.CastError) {
            return res.status(400).send({ error: "ID utilisateur ou de caisse invalide." });
        }
        res.status(500).send({ error: 'Erreur lors de la récupération des caisses par utilisateur', details: err.message });
    }
});

// CONSERVER CETTE VERSION

// GET /api/caisses/:id/solde (Calculer le solde de SA propre caisse)
router.get("/:id/solde", verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
    try {
        const caisseId = req.params.id;

        // Vérif ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(caisseId)) {
            return res.status(400).json({ message: "ID de caisse invalide" });
        }

        const caisse = await Caisse.findById(caisseId);
        if (!caisse) {
            return res.status(404).json({ message: "Caisse non trouvée" });
        }

        const userRole = req.user.role;
        const userSocietesIds = req.user.societes.map(s => s._id.toString());
        const caisseSocieteId = caisse.societe ? caisse.societe.toString() : null;

        // Vérif appartenance société
        if (userRole !== 'super-admin' && caisseSocieteId && !userSocietesIds.includes(caisseSocieteId)) {
            return res.status(403).json({ message: "Accès refusé. Cette caisse n'appartient pas à votre société." });
        }

      // Gardez la vérification du caissier attitré si vous souhaitez la maintenir
        if (userRole === 'caissier' && caisse.utilisateur && caisse.utilisateur.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas le caissier de cette caisse." });
        }
        
        // Logique de calcul du solde
        const mouvements = await MvtCaisse.find({ caisse: caisseId, etat: "valide" });
        const totalMouvements = mouvements.reduce((total, mvt) => {
            const montant = mvt.montant || 0;
            return mvt.typeMouvement === "encaissement" ? total + montant : total - montant;
        }, 0);

        const soldeCalcule = (caisse.soldeInitial || 0) + totalMouvements;

        res.json({
            soldeInitial: caisse.soldeInitial || 0,// Nécessaire pour le calcul dans le frontend
            soldeCalcule: parseFloat(soldeCalcule.toFixed(2)), // Solde avant les mouvements en cours
            totalMouvements: parseFloat(totalMouvements.toFixed(2)),
        });
    } catch (err) {
        console.error("❌ Erreur calcul solde caisse :", err);
        res.status(500).json({ message: "Erreur serveur", details: err.message });
    }
});
// NOUVEAU CODE (Récupération directe du solde stocké)

// GET /api/caisses/ (Voir toutes les caisses avec un filtre de recherche)
router.get('/', verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
    try {
        const { search = '', companyId } = req.query; // 🔹 récupère l'ID société choisi
        let query = {};
        const userRole = req.user.role;
        const userSocietesIds = req.user.societes ? req.user.societes.map(s => s._id.toString()) : [];

        if (search) {
            const isNumber = !isNaN(search);
            query.$or = [
                { libelle: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                ...(isNumber ? [
                    { soldeInitial: Number(search) },
                    { seuilMax: Number(search) }
                ] : [])
            ];
        }

        // 🔹 Filtrage par rôle
        if (userRole === 'caissier') {
            query.utilisateur = req.user._id;
        } 
        else if (userRole === 'responsable') {
            if (userSocietesIds.length > 0) {
                query.societe = { $in: userSocietesIds };
            } else {
                return res.status(200).send([]);
            }
        }
        // 🔹 MODIFICATION: Les admins et super-admins peuvent voir toutes les sociétés.
        // Le filtre 'companyId' n'est appliqué que si l'utilisateur n'est pas admin ou super-admin
        if (userRole === 'admin' || userRole === 'super-admin') {
            if (companyId && companyId !== "all") {
                query.societe = companyId;
            }
        } else {
            // Le filtre s'applique normalement aux autres rôles
            if (companyId && companyId !== "all") {
                query.societe = companyId;
            } else if (userSocietesIds.length > 0) {
                query.societe = { $in: userSocietesIds };
            } else {
                return res.status(200).send([]);
            }
        }
        
        const caisses = await Caisse.find(query)
            .populate("utilisateur", "name role")
            .populate("societe", "name")
            .select("-__v");

        res.status(200).send(caisses);
    } catch (err) {
        console.error("Erreur API :", err);
        res.status(500).send({ error: 'Erreur lors de la récupération', details: err.message });
    }
});

// POST /api/caisses/ (Créer une nouvelle caisse)
router.post('/', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const { libelle, soldeInitial, seuilMax = 0, utilisateur, societe } = req.body;

        // 1️⃣ Déterminer la société en se basant sur le choix du frontend
        let societeId;
        if (req.user.role === 'super-admin') {
            societeId = societe;
        } else { // Rôle 'admin'
            // L'administrateur peut créer dans n'importe laquelle de ses sociétés,
            // donc on utilise l'ID envoyé par le frontend.
            societeId = societe;
        }

        // 2️⃣ Validation des champs requis
        if (!libelle || soldeInitial == null || !utilisateur || !societeId) {
            return res.status(400).send({ error: "Champs requis manquants." });
        }
        console.log("🟢 societeId reçu :", societeId);
        console.log("🟢 sociétés dans le token :", req.user.societes);
        console.log("🟢 formatées :", req.user.societes.map(s => s._id ? s._id.toString() : s.toString()));

       const userSocieteIds = req.user.societes.map(s => s._id ? s._id.toString() : s.toString());
        if (req.user.role === 'admin' && !userSocieteIds.includes(societeId.toString())) {
            return res.status(403).send({ error: "Un administrateur ne peut créer des caisses que dans ses sociétés." });
        }


        // 4️⃣ Vérification que l'utilisateur assigné appartient bien à la société
        const user = await User.findById(utilisateur);
        if (!user || !user.societes.map(s => s.toString()).includes(societeId.toString())) {
            return res.status(400).send({ error: "L'utilisateur assigné n'appartient pas à la société sélectionnée." });
        }

        // 5️⃣ Génération du code unique pour la caisse
       // Génération du code unique pour la caisse
const lastCaisse = await Caisse.findOne({ societe: societeId })
    .sort({ code: -1 }) // trie décroissant sur le code
    .exec();

let nextNumber = 1;
if (lastCaisse && lastCaisse.code) {
    const match = lastCaisse.code.match(/CA(\d+)/);
    if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
    }
}

const code = `CA${String(nextNumber).padStart(2, "0")}`;

        // 6️⃣ Création de la caisse
        const newCaisse = new Caisse({
            code,
            libelle,
            soldeInitial,
            seuilMax,
            soldeActuel: soldeInitial,
            utilisateur,
            societe: societeId,
            dateCreation: new Date()
        });

        await newCaisse.save();
        res.status(201).send(newCaisse);

    } catch (err) {
        console.error("Erreur création caisse :", err);
        res.status(500).send({ error: "Erreur création caisse", details: err.message });
    }
});

// GET /api/caisses/:id (Obtenir une caisse par ID)
router.get('/:id', verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id)
            .populate("utilisateur", "name role")
            .populate("societe", "name")
            .select('-__v');
        
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });

        const userRole = req.user.role;
        const userSocietes = req.user.societes.map(s => s.toString());
        const caisseSocieteId = caisse.societe?._id?.toString();

        // 🚨 MODIFICATION : Les admins et super-admins peuvent voir toutes les caisses sans restriction de société
        if (userRole !== 'super-admin' && userRole !== 'admin' && caisseSocieteId && !userSocietes.includes(caisseSocieteId)) {
            console.log("❌ Accès refusé : Caisse d'une autre société.");
            return res.status(403).send({ error: 'Accès refusé. Cette caisse n\'appartient pas à votre société.' });
        }

        // Vérif caissier
        if (userRole === 'caissier' && caisse.utilisateur && caisse.utilisateur._id.toString() !== req.user._id.toString()) {
            console.log("❌ Accès refusé : L'utilisateur n'est pas le caissier de cette caisse.");
            return res.status(403).send({ error: 'Accès refusé. Vous n\'êtes pas le caissier de cette caisse.' });
        }

        res.status(200).send(caisse);
    } catch (err) {
        console.error("Erreur API :", err);
        res.status(500).send({ error: 'Erreur', details: err.message });
    }
});


// PUT /api/caisses/:id (Mettre à jour une caisse)
router.put('/:id', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id);
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });

        // 🚨 MODIFICATION : Les admins peuvent mettre à jour n'importe quelle caisse
        if (req.user.role === 'admin' && req.user.societes.length > 0 && !req.user.societes.map(s => s._id.toString()).includes(caisse.societe.toString())) {
            return res.status(403).send({ error: 'Accès refusé. Cette caisse n\'appartient pas à votre société.' });
        }
        
        // ⭐ NOUVELLE VALIDATION : VÉRIFIEZ QUE LE NOUVEL UTILISATEUR APPARTIENT BIEN À LA SOCIÉTÉ DE LA CAISSE
        const { utilisateur } = req.body;
        if (utilisateur) {
            const user = await User.findById(utilisateur);
            if (!user || !user.societes.map(s => s.toString()).includes(caisse.societe.toString())) {
                return res.status(400).send({ error: "L'utilisateur assigné n'appartient pas à la société de la caisse." });
            }
        }

        const updatedCaisse = await Caisse.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        res.status(200).send(updatedCaisse);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour', details: err });
    }
});
// DELETE /api/caisses/:id (Supprimer une caisse)
router.delete('/:id', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id);
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        
        // 🚨 MODIFICATION : Les admins peuvent supprimer n'importe quelle caisse
        if (req.user.role === 'admin' && req.user.societes.length > 0 && !req.user.societes.map(s => s._id.toString()).includes(caisse.societe.toString())) {
            return res.status(403).send({ error: 'Accès refusé. Cette caisse n\'appartient pas à votre société.' });
        }

        await Caisse.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Caisse supprimée avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});

router.patch('/:id/activer', verifyToken, checkRole(['super-admin', 'admin', 'responsable']), async (req, res) => {
    try {
      const caisse = await Caisse.findById(req.params.id);
      if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
 
      // Vérification d'appartenance à la société
     if (
  req.user.role === 'admin' &&
  req.user.societes.length > 0 &&
  !req.user.societes.map(s => s._id.toString()).includes(caisse.societe.toString())
) {
  return res
    .status(403)
    .send({ error: "Accès refusé. Cette caisse n'appartient pas à votre société." });
}


      caisse.active = !caisse.active;
      await caisse.save();
 
      res.status(200).send({ message: `Caisse ${caisse.active ? 'activée' : 'désactivée'}`, caisse });
    } catch (err) {
      res.status(500).send({ error: 'Erreur', details: err });
    }
});


// PATCH /api/caisses/:id/etat (Changer l'état d'une caisse)
router.patch('/:id/etat', verifyToken, checkRole(['super-admin', 'admin', 'responsable']), async (req, res) => {
    const { etat } = req.body;
 
    if (!["brouillon", "ouverte", "fermée"].includes(etat)) {
      return res.status(400).json({ message: "État non valide" });
    }
 
    try {
      const caisse = await Caisse.findById(req.params.id);
      if (!caisse) return res.status(404).json({ message: "Caisse non trouvée" });
 
      // Vérification d'appartenance à la société
      const userSocietes = req.user.societes.map(s => s.toString());
      if (req.user.role !== 'super-admin' && !userSocietes.includes(caisse.societe.toString())) {
        return res.status(403).json({ message: "Accès refusé. Cette caisse n'appartient pas à votre société." });
      }
 
      caisse.etat = etat;
      await caisse.save();
 
      res.json({ message: `État mis à jour`, caisse });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
});

router.patch("/:id/ouvrir", verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) return res.status(404).json({ message: "Caisse non trouvée" });

    caisse.etat = 'ouverte';
    caisse.dateOuverture = new Date();
    caisse.responsable = req.user._id;
    await caisse.save();

    res.json({ message: 'Caisse ouverte avec succès', caisse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// PUT /api/caisses/:id/fermer
router.patch("/:id/fermer", verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) return res.status(404).json({ message: "Caisse non trouvée" });

    caisse.etat = 'fermée';
    caisse.dateFermeture = new Date();
    await caisse.save();

    res.json({ message: 'Caisse fermée avec succès', caisse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
