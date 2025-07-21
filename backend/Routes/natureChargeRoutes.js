const express = require('express');
const NatureCharge = require('../Models/NatureCharge');
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

    const natureCharges = await NatureCharge.find(query).select('-__v');
    res.status(200).send(natureCharges);
  } catch (err) {
    console.error("Erreur API nature-charges :", err);
    res.status(500).send({ error: 'Erreur lors de la récupération', details: err });
  }
});


router.post('/', async (req, res) => {
    try {
        const item = new NatureCharge(req.body);
        await item.save();
        res.status(201).send(item);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création', details: err });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const item = await NatureCharge.findById(req.params.id).select('-__v');
        if (!item) return res.status(404).send({ error: 'Nature de charge non trouvée' });
        res.status(200).send(item);
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await NatureCharge.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!updated) return res.status(404).send({ error: 'Non trouvé' });
        res.status(200).send(updated);
    } catch (err) {
        res.status(400).send({ error: 'Erreur de mise à jour', details: err });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await NatureCharge.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).send({ error: 'Non trouvé' });
        res.status(200).send({ message: 'Supprimé avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur de suppression', details: err });
    }
});

module.exports = router;
