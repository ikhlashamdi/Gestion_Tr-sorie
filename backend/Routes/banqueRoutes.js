const express = require('express');
const Banque = require('../Models/Banque');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { code: { $regex: search, $options: 'i' } },
            { libelle: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const banques = await Banque.find(query).select('-__v');
    res.status(200).send(banques);
  } catch (err) {
    console.error("Erreur API banques :", err);
    res.status(500).send({ error: 'Erreur serveur', details: err });
  }
});
// Créer une banque
router.post('/', async (req, res) => {
    try {
        const banque = new Banque(req.body);
        await banque.save();
        res.status(201).send(banque);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création de la banque', details: err });
    }
});


// Récupérer une banque par ID
router.get('/:id', async (req, res) => {
    try {
        const banque = await Banque.findById(req.params.id).select('-__v');
        if (!banque) return res.status(404).send({ error: 'Banque non trouvée' });
        res.status(200).send(banque);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération de la banque', details: err });
    }
});

// Mettre à jour une banque
router.put('/:id', async (req, res) => {
    try {
        const banque = await Banque.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!banque) return res.status(404).send({ error: 'Banque non trouvée' });
        res.status(200).send(banque);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour de la banque', details: err });
    }
});

// Supprimer une banque
router.delete('/:id', async (req, res) => {
    try {
        const banque = await Banque.findByIdAndDelete(req.params.id);
        if (!banque) return res.status(404).send({ error: 'Banque non trouvée' });
        res.status(200).send({ message: 'Banque supprimée avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression de la banque', details: err });
    }
});

module.exports = router;
