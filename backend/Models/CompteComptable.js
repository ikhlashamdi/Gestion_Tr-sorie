const mongoose = require('mongoose');

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

const CompteComptable = mongoose.model('CompteComptable', compteComptableSchema);

module.exports = CompteComptable;