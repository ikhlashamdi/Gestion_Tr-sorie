// models/Banque.js
const mongoose = require('mongoose');

const banqueSchema = new mongoose.Schema({
    code: { type: String, required: true },
    numCompte: { type: String, required: true, match: /^\d{20}$/ },
    banque: [{ type: String }],
    description: { type: String }
});

module.exports = mongoose.model('Banque', banqueSchema);
