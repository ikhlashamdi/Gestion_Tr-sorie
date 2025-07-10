const express = require('express');
const CompteComptable = require('../Models/CompteComptable');
const router = express.Router();

// Route pour créer un compte comptable (POST)
router.post('/api/comptescomptables', async (req, res) => {
    try {
        const { num_cpte, libelle, num_cpte_com } = req.body;

        const compteComptable = new CompteComptable({
            num_cpte,
            libelle,
            num_cpte_com
        });

        await compteComptable.save();
        res.status(201).send(compteComptable);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la création du compte comptable', details: err });
    }
});

// Route pour obtenir tous les comptes comptables (GET)
router.get('/api/comptescomptables', async (req, res) => {
    console.log('Requête GET sur /api/comptescomptables');
    try {
        const comptesComptables = await CompteComptable.find().select('-__v');
        res.status(200).send(comptesComptables);
    } catch (err) {
        console.error('Erreur:', err); // Log de l'erreur
        res.status(500).send({ error: 'Erreur lors de la récupération des comptes comptables', details: err });
    }
});


// Route pour obtenir un compte comptable par son ID (GET)
router.get('/api/comptescomptables/:id', async (req, res) => {
    try {
        const compteComptable = await CompteComptable.findById(req.params.id).select('-__v');
        if (!compteComptable) {
            return res.status(404).send({ error: 'Compte comptable non trouvé' });
        }
        res.status(200).send(compteComptable);
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la récupération du compte comptable', details: err });
    }
});

// Route pour mettre à jour un compte comptable par son ID (PUT)
router.put('/api/comptescomptables/:id', async (req, res) => {
    try {
        const { num_cpte, libelle, num_cpte_com } = req.body;

        const compteComptable = await CompteComptable.findByIdAndUpdate(
            req.params.id,
            { num_cpte, libelle, num_cpte_com },
            { new: true }
        ).select('-__v');

        if (!compteComptable) {
            return res.status(404).send({ error: 'Compte comptable non trouvé' });
        }

        res.status(200).send(compteComptable);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour du compte comptable', details: err });
    }
});

// Route pour supprimer un compte comptable par son ID (DELETE)
router.delete('/api/comptescomptables/:id', async (req, res) => {
    try {
        const compteComptable = await CompteComptable.findByIdAndDelete(req.params.id).select('-__v');

        if (!compteComptable) {
            return res.status(404).send({ error: 'Compte comptable non trouvé' });
        }

        res.status(200).send({ message: 'Compte comptable supprimé avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur lors de la suppression du compte comptable', details: err });
    }
});







