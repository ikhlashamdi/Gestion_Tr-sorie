const express = require('express');
const Caisse = require('../Models/Caisse');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    console.log("🔍 Recherche reçue :", search);

    const query = search
      ? {
          $or: [
            { libelle: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
          ],
        }
      : {};

    const caisses = await Caisse.find(query).select('-__v');
    res.status(200).send(caisses);
  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).send({ error: 'Erreur lors de la récupération', details: err });
  }
});


// Créer une caisse
router.post('/', async (req, res) => {
    try {
        const caisse = new Caisse(req.body);
        await caisse.save();
        res.status(201).send(caisse);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création de la caisse', details: err });
    }
});



// Obtenir une caisse par ID
router.get('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id).select('-__v');
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send(caisse);
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});

// Mettre à jour une caisse
router.put('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send(caisse);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour', details: err });
    }
});

// Supprimer une caisse
router.delete('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findByIdAndDelete(req.params.id);
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send({ message: 'Caisse supprimée avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});

module.exports = router;
