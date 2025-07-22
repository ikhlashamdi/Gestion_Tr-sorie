const mongoose = require('mongoose');

const mvtCaisseSchema = new mongoose.Schema({
caisseCode: String,
typeMouvement: String,
natureChargeCode: String,
tierType: String,
tierCode: String,
montant: Number,
date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MvtCaisse', mvtCaisseSchema);