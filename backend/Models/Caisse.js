const mongoose = require('mongoose');


const caisseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true
    }
});

const Caisse = mongoose.model('Caisse', caisseSchema);

module.exports = Caisse;
