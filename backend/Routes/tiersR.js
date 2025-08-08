const express = require('express');
const router = express.Router();

const Client = require('../Models/Client');
const Fournisseur = require('../Models/fournisseur');
const Banque = require('../Models/Banque');
const Vehicule = require('../Models/Vehicule');
const Personnel = require('../Models/Personnel');
const Tiers = require('../Models/Tier'); 

router.get('/', async (req, res) => {
  try {
    const model = req.query.model;

    if (!model) {
      return res.status(400).json({ error: "Le paramètre 'model' est obligatoire." });
    }

    let data = [];

    switch(model) {
      case 'Client':
        data = await Client.find().select('-__v');
        break;
      case 'Fournisseur':
        data = await Fournisseur.find().select('-__v');
        break;
      case 'Banque':
        data = await Banque.find().select('-__v');
        break;
      case 'Vehicule':
        data = await Vehicule.find().select('-__v');
        break;
      case 'Personnel':
        data = await Personnel.find().select('-__v');
        break;
      case 'Tiers':
        data = await Tiers.find().select('-__v');
        break;
      default:
        return res.status(400).json({ error: "Modèle invalide." });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur récupération tiers :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
