const mongoose = require('mongoose');

// Définition du schéma pour un journal
const journalSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true
    },
    libelle: {
        type: String,
        required: true
    }
});

// Création du modèle pour le journal
const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
