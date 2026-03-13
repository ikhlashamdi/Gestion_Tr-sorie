const mongoose = require('mongoose');


const natureChargeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    libelle: {
        type: String,
        required: true,
        unique: true,
    }
});

const NatureCharge = mongoose.model('NatureCharge', natureChargeSchema);

module.exports = NatureCharge;
