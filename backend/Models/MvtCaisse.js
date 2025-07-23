const mongoose = require('mongoose');

const mvtCaisseSchema = new mongoose.Schema({
caisseCode: String,
typeMouvement: String,
  natureCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NatureCharge"
  },

tierType: String,
tierCode: String,
montant: Number,
date: { type: Date, default: Date.now },

type: {
type: String,
enum: ["entrée", "sortie"],
required: false,
},
caisse: {
type: mongoose.Schema.Types.ObjectId,
ref: "Caisse",
},
});




module.exports = mongoose.model('MvtCaisse', mvtCaisseSchema);