const mongoose = require('mongoose');

const societeSchema = new mongoose.Schema({
    code: { type: String, default: () => Math.random().toString(36).substring(2, 10) },
    designation: { type: String, required: true },
    adresse: { type: String },
    immatriculeFiscal: { type: String },
    registreCommerce: { type: String },
    timbre: { type: Number }
});

module.exports = mongoose.model('Societe', societeSchema);
