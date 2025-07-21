// routes/client.js

const express = require('express');
const Client = require('../Models/Client');
const router = express.Router();

// ✅ Récupérer tous les clients (avec recherche)
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    console.log("🔍 Recherche client :", search);

    const query = search
      ? {
          $or: [
            { code: { $regex: search, $options: 'i' } },
            { client: { $regex: search, $options: 'i' } },
            { matricule: { $regex: search, $options: 'i' } },
            { contact: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const clients = await Client.find(query).select('-__v');
    res.status(200).send(clients);
  } catch (err) {
    console.error("Erreur récupération clients :", err);
    res.status(500).send({ error: 'Erreur lors de la récupération', details: err });
  }
});

// ✅ Créer un client
router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).send(client);
  } catch (err) {
    res.status(400).send({ error: 'Erreur lors de la création du client', details: err });
  }
});

// ✅ Récupérer un client par ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-__v');
    if (!client) return res.status(404).send({ error: 'Client non trouvé' });
    res.status(200).send(client);
  } catch (err) {
    res.status(500).send({ error: 'Erreur lors de la récupération du client', details: err });
  }
});

// ✅ Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
    if (!client) return res.status(404).send({ error: 'Client non trouvé' });
    res.status(200).send(client);
  } catch (err) {
    res.status(400).send({ error: 'Erreur lors de la mise à jour du client', details: err });
  }
});

// ✅ Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).send({ error: 'Client non trouvé' });
    res.status(200).send({ message: 'Client supprimé avec succès' });
  } catch (err) {
    res.status(500).send({ error: 'Erreur lors de la suppression du client', details: err });
  }
});

module.exports = router;
