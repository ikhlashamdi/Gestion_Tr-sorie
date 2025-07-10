const mongoose = require('mongoose');

// Définition du schéma pour un compte comptable
const compteComptableSchema = new mongoose.Schema({
    num_cpte: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true
    },
    num_cpte_com: {
        type: String,
        required: true
    }
});

// Création du modèle pour le compte comptable
const CompteComptable = mongoose.model('CompteComptable', compteComptableSchema);

module.exports = CompteComptable;