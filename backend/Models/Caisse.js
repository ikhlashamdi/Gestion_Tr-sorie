const mongoose = require('mongoose');
const caisseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    libelle: {
        type: String,
        required: true
    },
    soldeInitial: {
    type: Number,
    default: 0,
    min: 0,
    validate: null,
    validate: {
      validator: function (value) {
        if (this.seuilMax > 0) {
          return value <= this.seuilMax;
        }
        return true; 
      },
      message: "Le solde ne peut pas dépasser le seuil maximal.",
    },
    
  },
  soldeActuel: {
    type: Number,
    required: true,
    min: 0
  },
  seuilMax: {
    type: Number,
    default: 0,
    min: 0,
    required: true,
  },
 dateCreation: {
    type: Date,
    default: Date.now
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  
  societe: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Company",
  required: true
},

etat: {
  type: String,
  enum: ['brouillon', 'confirme', 'annule'],
  default: 'brouillon'
},
  active: {
    type: Boolean,
    default: true
  }});
  
  

const Caisse = mongoose.model('Caisse', caisseSchema);

module.exports = Caisse;
