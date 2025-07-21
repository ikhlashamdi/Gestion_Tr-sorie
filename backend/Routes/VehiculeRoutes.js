const express = require('express');
const Vehicule = require('../Models/Vehicule');
const router = express.Router();

// GET /api/vehicules?search=xxx
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { code: { $regex: search, $options: 'i' } },
            { libelle: { $regex: search, $options: 'i' } },
            { numv: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const vehicules = await Vehicule.find(query).select('-__v');
    res.status(200).json(vehicules);
  } catch (err) {
    console.error('Erreur récupération véhicules :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
});



// Créer un véhicule
router.post('/', async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        await vehicule.save();
        res.status(201).send(vehicule);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création du véhicule', details: err });
    }
});


// Récupérer un véhicule par ID
router.get('/:id', async (req, res) => {
    try {
        const vehicule = await Vehicule.findById(req.params.id).select('-__v');
        if (!vehicule) return res.status(404).send({ error: 'Véhicule non trouvé' });
        res.status(200).send(vehicule);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération du véhicule', details: err });
    }
});

// Mettre à jour un véhicule
router.put('/:id', async (req, res) => {
    try {
        const vehicule = await Vehicule.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!vehicule) return res.status(404).send({ error: 'Véhicule non trouvé' });
        res.status(200).send(vehicule);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour du véhicule', details: err });
    }
});

// Supprimer un véhicule
router.delete('/:id', async (req, res) => {
    try {
        const vehicule = await Vehicule.findByIdAndDelete(req.params.id);
        if (!vehicule) return res.status(404).send({ error: 'Véhicule non trouvé' });
        res.status(200).send({ message: 'Véhicule supprimé avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression du véhicule', details: err });
    }
});

module.exports = router;
