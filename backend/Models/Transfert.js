const mongoose = require("mongoose");

const transfertSchema = new mongoose.Schema({
  caisseSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caisse",
    required: true
  },
  caisseDestination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caisse",
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },

   reference: {
     type: String,
     unique: true 
  },

  motif: {
    type: String,
    required: true
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transfert", transfertSchema);
