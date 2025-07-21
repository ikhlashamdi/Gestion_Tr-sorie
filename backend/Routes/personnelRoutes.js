const express = require('express');
const Personnel = require('../Models/Personnel');
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

    const personnels = await Personnel.find(query).select('-__v');
    res.status(200).send(personnels);
  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).send({ error: 'Erreur lors de la récupération', details: err });
  }
});


// ✅ Créer un personnel
router.post('/', async (req, res) => {
  try {
    const personnel = new Personnel(req.body);
    await personnel.save();
    res.status(201).send(personnel);
  } catch (err) {
    res.status(400).send({ error: 'Erreur lors de la création du personnel', details: err });
  }
});

// ✅ Récupérer un personnel par ID
router.get('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id).select('-__v');
    if (!personnel) return res.status(404).send({ error: 'Personnel non trouvé' });
    res.status(200).send(personnel);
  } catch (err) {
    res.status(500).send({ error: 'Erreur lors de la récupération du personnel', details: err });
  }
});

// ✅ Mettre à jour un personnel
router.put('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
    if (!personnel) return res.status(404).send({ error: 'Personnel non trouvé' });
    res.status(200).send(personnel);
  } catch (err) {
    res.status(400).send({ error: 'Erreur lors de la mise à jour du personnel', details: err });
  }
});

// ✅ Supprimer un personnel
router.delete('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findByIdAndDelete(req.params.id);
    if (!personnel) return res.status(404).send({ error: 'Personnel non trouvé' });
    res.status(200).send({ message: 'Personnel supprimé avec succès' });
  } catch (err) {
    res.status(500).send({ error: 'Erreur lors de la suppression du personnel', details: err });
  }
});

module.exports = router;
