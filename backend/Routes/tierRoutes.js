const express = require('express');
const Tier = require('../Models/Tier');
const router = express.Router();

// 🔍 GET : liste des tiers avec recherche facultative
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { code: { $regex: search, $options: 'i' } },
            { libelle: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const tiers = await Tier.find(query).select('-__v');
    res.status(200).send(tiers);
  } catch (err) {
    console.error("Erreur lors de la récupération des tiers :", err);
    res.status(500).send({ error: 'Erreur serveur', details: err });
  }
});


// Créer un tier
router.post('/', async (req, res) => {
    try {
        const tier = new Tier(req.body);
        await tier.save();
        res.status(201).send(tier);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création du tier', details: err });
    }
});


// Récupérer un tier par ID
router.get('/:id', async (req, res) => {
    try {
        const tier = await Tier.findById(req.params.id).select('-__v');
        if (!tier) return res.status(404).send({ error: 'Tier non trouvé' });
        res.status(200).send(tier);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération du tier', details: err });
    }
});

// Mettre à jour un tier
router.put('/:id', async (req, res) => {
    try {
        const tier = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!tier) return res.status(404).send({ error: 'Tier non trouvé' });
        res.status(200).send(tier);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour du tier', details: err });
    }
});

// Supprimer un tier
router.delete('/:id', async (req, res) => {
    try {
        const tier = await Tier.findByIdAndDelete(req.params.id);
        if (!tier) return res.status(404).send({ error: 'Tier non trouvé' });
        res.status(200).send({ message: 'Tier supprimé avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression du tier', details: err });
    }
});

module.exports = router;
