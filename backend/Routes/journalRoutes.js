const express = require('express');
const Journal = require('../Models/Journal');
const router = express.Router();

// Route pour créer un journal (POST)
router.post('/api/journals', async (req, res) => {
    try {
        const { numero, libelle } = req.body;

        // Créer un nouveau journal
        const journal = new Journal({
            numero,
            libelle
        });

        // Sauvegarder le journal dans la base de données
        await journal.save();
        res.status(201).send(journal); // Réponse avec l'objet journal créé
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création du journal', details: err });
    }
});

// Route pour obtenir tous les journaux (GET)
router.get('/api/journals', async (req, res) => {
    try {
        const journals = await Journal.find().select('-__v'); // Exclure le champ __v
        res.status(200).send(journals); // Réponse avec la liste des journaux
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération des journaux', details: err });
    }
});

// Route pour obtenir un journal par son ID (GET)
router.get('/api/journals/:id', async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id).select('-__v'); // Exclure le champ __v
        if (!journal) {
            return res.status(404).send({ error: 'Journal non trouvé' });
        }
        res.status(200).send(journal);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération du journal', details: err });
    }
});

// Route pour mettre à jour un journal par son ID (PUT)
router.put('/api/journals/:id', async (req, res) => {
    try {
        const { numero, libelle } = req.body;

        const journal = await Journal.findByIdAndUpdate(
            req.params.id,
            { numero, libelle },
            { new: true } // Retourner l'objet mis à jour
        ).select('-__v'); // Exclure le champ __v

        if (!journal) {
            return res.status(404).send({ error: 'Journal non trouvé' });
        }

        res.status(200).send(journal);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour du journal', details: err });
    }
});

// Route pour supprimer un journal par son ID (DELETE)
router.delete('/api/journals/:id', async (req, res) => {
    try {
        const journal = await Journal.findByIdAndDelete(req.params.id).select('-__v'); // Exclure le champ __v

        if (!journal) {
            return res.status(404).send({ error: 'Journal non trouvé' });
        }

        res.status(200).send({ message: 'Journal supprimé avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression du journal', details: err });
    }
});

module.exports = router;
