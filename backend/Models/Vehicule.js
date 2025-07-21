const mongoose = require('mongoose');


const vehiculeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true
    },
    numv: {
        type: String,
        required: true
    }
});

const Vehicule = mongoose.model('Vehicule', vehiculeSchema);

module.exports = Vehicule;
