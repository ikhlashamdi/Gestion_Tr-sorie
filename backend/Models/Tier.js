const mongoose = require('mongoose');


const tierSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true
    },
        model: {       
        type: String,
        enum: ["Client", "Fournisseur", "Vehicule", "Personnel", "Banque", "Tiers"],
        required: false
    }
});

const Tier = mongoose.model('Tier', tierSchema);

module.exports = Tier;
