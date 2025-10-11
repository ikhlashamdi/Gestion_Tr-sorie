const mongoose = require('mongoose');

const mvtCaisseSchema = new mongoose.Schema({
  caisse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caisse",
    required: true
  },

  typeMouvement: {
    type: String,
    required: true,
    enum: ["encaissement", "decaissement"]
  },

  natureCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NatureCharge"
  },

  tier: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'tierModel',
    required: false
  },

  tierModel: {
    type: String,
    enum: ["Client", "Fournisseur", "Vehicule", "Personnel", "Banque", "Tiers"],
    required: false
  },

  montant: {
    type: Number,
    required: true,
    min: 0
  },

  date: {
    type: Date,
    default: Date.now
  },

  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  etat: {
    type: String,
    enum: ["brouillon", "ouverte", "annule"],
    default: "brouillon",
    required: false
  },

  description: {
    type: String,
    trim: true,
    required: false
  }
});

module.exports = mongoose.model('MvtCaisse', mvtCaisseSchema);
