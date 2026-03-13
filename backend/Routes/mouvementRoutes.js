const express = require('express');
const router = express.Router();
const Caisse = require('../Models/Caisse');
const MvtCaisse = require('../Models/MvtCaisse');
const Client = require('../Models/Client'); 
const Vehicule = require('../Models/Vehicule'); 
const Personnel = require('../Models/Personnel'); 
const Banque = require('../Models/Banque'); 
const Tiers = require('../Models/Tier'); 
const Fournisseur = require('../Models/fournisseur'); 
const mouvementController = require('../Controllers/mouvementController');
const mongoose = require('mongoose');

const checkRole = require("../Middlewares/roleMiddleware"); 

router.get('/', async (req, res) => {
  const { start, end, caisse, etat } = req.query;

  try {
    if (!start || !end) {
      return res.status(400).json({ message: 'Les dates de début et fin sont requises' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Format de date invalide' });
    }
    endDate.setHours(23, 59, 59, 999);

    let query = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (caisse) {
      if (!mongoose.Types.ObjectId.isValid(caisse)) {
        return res.status(400).json({ message: 'ID de caisse invalide' });
      }
      query.caisse = caisse;
    }

    if (etat) {
      query.etat = etat;
    }

    let mouvements = await MvtCaisse.find(query)
      .populate('caisse')
      .populate('natureCharge')
      .populate('utilisateur', 'name email')
      .lean();

    const tierModels = { Client, Fournisseur, Vehicule, Personnel, Banque, Tiers};
    for (let mvt of mouvements) {
      if (mvt.tier && mvt.tierModel && tierModels[mvt.tierModel]) {
        const Model = tierModels[mvt.tierModel];
        mvt.tier = await Model.findById(mvt.tier).lean() || null;
      }
    }

    res.json(mouvements);
  } catch (err) {
    console.error('Erreur récupération mouvements:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


router.post("/batch", async (req, res) => {
  try {
    const { mouvements, utilisateur, caisse } = req.body;

    if (!utilisateur || !caisse || !Array.isArray(mouvements)) {
      return res.status(400).json({ message: "Champs manquants ou invalides" });
    }

    const caisseDoc = await Caisse.findById(caisse);
    if (!caisseDoc) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }
    if (!caisseDoc.active) {
      return res.status(403).json({ message: "❌ Cette caisse est inactive. Impossible d’ajouter des mouvements." });
    }

    // Préparer les documents à insérer
    const docsToInsert = mouvements.map((mvt) => ({
  date: mvt.date,
  description: mvt.description,
  typeMouvement: mvt.typeMouvement,
  montant: mvt.montant,
  natureCharge: mvt.natureCharge || null,
  tier: mvt.tier || null,
  tierModel: mvt.tierModel || null,  
  caisse,
  utilisateur,
  etat: "ouverte"
}));


    await MvtCaisse.insertMany(docsToInsert);

    // Recalculer le solde actuel à partir des mouvements valides
    const mouvementsValides = await MvtCaisse.find({ caisse, etat: "ouverte" });

    const soldeActuel = mouvementsValides.reduce((acc, mvt) => {
      return mvt.typeMouvement === "decaissement"
        ? acc - mvt.montant
        : acc + mvt.montant;
    }, 0);

    const nouveauSolde = (caisseDoc.soldeInitial || 0) + soldeActuel;
    caisseDoc.soldeActuel = nouveauSolde;
    await caisseDoc.save();

    res.status(201).json({ message: "Mouvements enregistrés et solde mis à jour." });
  } catch (err) {
    console.error("Erreur lors du batch insert :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.body.utilisateur;
    const caisseId = req.body.caisse;

    const caisseDoc = await Caisse.findById(caisseId);
    if (!caisseDoc) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }
    if (!caisseDoc.active) {
      return res.status(403).json({ message: "❌ Caisse inactive. Ajout impossible." });
    }

    const mouvement = new MvtCaisse({
      ...req.body,
      utilisateur: userId,
      etat: "brouillon"
    });

    await mouvement.save();
    res.status(201).json({ message: "Mouvement créé en brouillon", mouvement });
  } catch (err) {
    console.error("Erreur création mouvement:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

router.patch('/:id/etat', async (req, res) => {
  const { id } = req.params;
  const { etat } = req.body;

  if (!["ouverte", "fermée"].includes(etat)) {
    return res.status(400).json({ message: "État invalide" });
  }
if (mouvement.etat === "fermée" && etat === "ouverte") {
  return res.status(400).json({ message: "Impossible de valider un mouvement annulé." });
}

  try {
    const mouvement = await MvtCaisse.findById(id);
    if (!mouvement) return res.status(404).json({ message: "Mouvement non trouvé" });

    mouvement.etat = etat;
    await mouvement.save();

    res.json({ message: `Mouvement ${etat}`, mouvement });
  } catch (err) {
    console.error("Erreur mise à jour état:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



router.get('/historique/:caisseId', async (req, res) => {
  const { caisseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(caisseId)) {
    return res.status(400).json({ message: "ID caisse invalide." });
  }

  try {
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse introuvable." });
    }

    const mouvements = await MvtCaisse.find({
      caisse: caisseId,
      etat: 'ouverte'
    })
      .sort({ date: 1 })
      .populate({ path: 'natureCharge', select: 'libelle code' })
      .populate({ path: 'utilisateur', select: 'name' })
      .lean();

    //  Résolution manuelle du tier selon tierModel
    const tierModels = { Client, Fournisseur, Vehicule, Personnel, Banque, Tiers };
    for (let mvt of mouvements) {
      if (mvt.tier && mvt.tierModel && tierModels[mvt.tierModel]) {
        const Model = tierModels[mvt.tierModel];
        mvt.tier = await Model.findById(mvt.tier).select('libelle code rsoc').lean() || null;
      }
    }

    let solde = caisse.soldeInitial || 0;
    const historique = mouvements.map(mvt => {
      const montant = mvt.typeMouvement === 'encaissement'
        ? mvt.montant
        : -mvt.montant;

      solde += montant;

      return {
        _id: mvt._id,
        date: mvt.date,
        typeMouvement: mvt.typeMouvement,
        montant: mvt.montant,
        natureCharge: mvt.natureCharge?._id || null,
        tier: mvt.tier?._id || null,
        tierLibelle: mvt.tier?.libelle || null,   
        tierCode: mvt.tier?.code || null,
        tierModel: mvt.tierModel || null,
        utilisateur: mvt.utilisateur?.name || null,
        description: mvt.description || '',
        soldeCourant: solde
      };
    });

    res.json({
      caisse: { libelle: caisse.libelle, code: caisse.code },
      soldeInitial: caisse.soldeInitial,
      soldeFinal: solde,
      historique
    });

  } catch (err) {
    console.error("Erreur historique caisse :", err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/recent/:caisseId', async (req, res) => {
  const { caisseId } = req.params;
  const limit = parseInt(req.query.limit) || 5;

  if (!mongoose.Types.ObjectId.isValid(caisseId)) {
    return res.status(400).json({ message: "ID caisse invalide." });
  }

  try {
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse introuvable." });
    }

    const mouvements = await MvtCaisse.find({
      caisse: caisseId,
      etat: 'ouverte'
    })
      .sort({ date: -1, createdAt: -1 }) // Les plus récents en premier
      .limit(limit)
      .populate({ path: 'natureCharge', select: 'libelle code' })
      .populate({ path: 'utilisateur', select: 'name' })
      .lean();

    
    const tierModels = { Client, Fournisseur, Vehicule, Personnel, Banque, Tiers };
    for (let mvt of mouvements) {
      if (mvt.tier && mvt.tierModel && tierModels[mvt.tierModel]) {
        const Model = tierModels[mvt.tierModel];
        mvt.tier = await Model.findById(mvt.tier).select('libelle code rsoc nomComplet raisonSociale').lean() || null;
      }
    }


    const mouvementsFormates = mouvements.map(mvt => ({
      _id: mvt._id,
      date: mvt.date,
      typeMouvement: mvt.typeMouvement,
      montant: mvt.montant,
      description: mvt.description || '',
      natureCharge: mvt.natureCharge,
      tier: mvt.tier,
      tierModel: mvt.tierModel,
      utilisateur: mvt.utilisateur,
      createdAt: mvt.createdAt
    }));

    res.json(mouvementsFormates);

  } catch (err) {
    console.error("Erreur récupération mouvements récents :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get('/daily-summary/:caisseId', mouvementController.getDailySummary);



router.put('/:id/valider', checkRole(['responsable']) , async (req, res) => {
  try {
    const mouvement = await MvtCaisse.findById(req.params.id);
    if (!mouvement) return res.status(404).json({ message: "Mouvement non trouvé" });

    if (mouvement.etat !== 'brouillon')
      return res.status(400).json({ message: "Ce mouvement est déjà traité" });

    mouvement.etat = 'ouverte';
    await mouvement.save();

    const caisse = await Caisse.findById(mouvement.caisse);
    if (mouvement.typeMouvement === 'encaissement') {
      caisse.soldeActuel += mouvement.montant;
    } else {
      caisse.soldeActuel -= mouvement.montant;
    }
    await caisse.save();

    res.json({ message: 'Mouvement validé et solde mis à jour', mouvement, caisse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;