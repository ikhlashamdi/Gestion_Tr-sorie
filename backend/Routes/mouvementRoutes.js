const express = require('express');
const router = express.Router();
const MvtCaisse = require('../Models/MvtCaisse');
const Caisse = require("../Models/Caisse");
const NatureCharge = require('../Models/NatureCharge');
const Client = require('../Models/Client');
const Fournisseur = require('../Models/fournisseur');
const Tiers = require('../Models/Tier');
const Vehicule = require('../Models/Vehicule');
const Personnel = require('../Models/Personnel');
const Banque = require('../Models/Banque');

// ✅ GET mouvements dans une durée donnée
router.get('/', async (req, res) => {
const { start, end, caisse } = req.query;
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (caisse) {
      query.caisseCode = caisse; // ← Important ici
    }

let mouvements = await MvtCaisse.find(query)
  .populate('caisse')
  .populate('natureCharge')
  .lean();

// Enrichir chaque mouvement avec les infos du tiers
for (let mvt of mouvements) {
  let model;
  switch (mvt.tierType) {
    case 'clients':
      model = Client;
      break;
    case 'fournisseurs':
      model = Fournisseur;
      break;
    case 'vehicule':
      model = Vehicule;
      break;
    case 'personnel':
      model = Personnel;
      break;
    case 'banque':
      model = Banque;
      break;
    default:
      model = Tiers;
  }

  const doc = await model.findOne({ code: mvt.tierCode }).lean();
  mvt.tier = doc || null;
}

res.json(mouvements);
} catch (err) {
console.error('Erreur récupération mouvements:', err);
res.status(500).json({ message: 'Erreur serveur' });
}
});

// ✅ POST mouvement
router.post('/', async (req, res) => {
  try {
    const mouvement = new MvtCaisse(req.body);
    await mouvement.save();
    res.status(201).json({ message: "Mouvement enregistré", mouvement });
  } catch (err) {
    console.error("Erreur création mouvement:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

module.exports = router;


