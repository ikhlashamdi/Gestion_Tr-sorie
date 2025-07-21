const mongoose = require('mongoose');


const tierSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true
    }
});

const Tier = mongoose.model('Tier', tierSchema);

module.exports = Tier;
