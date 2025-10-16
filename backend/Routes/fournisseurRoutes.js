const Fournisseur = require('../Models/fournisseur');

const express = require('express');

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { code: { $regex: search, $options: 'i' } },
            { rsoc: { $regex: search, $options: 'i' } },
            { adresse: { $regex: search, $options: 'i' } },
            { tel: { $regex: search, $options: 'i' } },
            { mf: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const fournisseurs = await Fournisseur.find(query).select('-__v');
    res.status(200).json(fournisseurs);
  } catch (err) {
    console.error('Erreur récupération fournisseurs :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
});


router.post('/', async (req, res) => {
  try {
    const fournisseur = new Fournisseur(req.body);
    await fournisseur.save();
    res.status(201).json(fournisseur);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création du fournisseur', details: err });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id).select('-__v');
    if (!fournisseur) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.status(200).json(fournisseur);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du fournisseur', details: err });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
    if (!fournisseur) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.status(200).json(fournisseur);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du fournisseur', details: err });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);
    if (!fournisseur) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du fournisseur', details: err });
  }
});

module.exports = router;
