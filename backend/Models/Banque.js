// models/Banque.js
const mongoose = require('mongoose');

const banqueSchema = new mongoose.Schema({
    code: { type: String, required: true },
      libelle: {
        type: String,
        required: true
    },
      numcompte: { type: String, required: true },           
               
  description: { type: String },                         
  soldeinit: { type: Number, default: 0.000 },           
  respece: { type: Number, default: 0.000 },
  rcheque: { type: Number, default: 0.000 },
  reffet: { type: Number, default: 0.000 },
  impcheque: { type: Number, default: 0.000 },
  impeffet: { type: Number, default: 0.000 },
  nblcheque: { type: Number, default: 0.000 },
  nbleffet: { type: Number, default: 0.000 },
  retespece: { type: Number, default: 0.000 },
  virement: { type: Number, default: 0.000 },
  adresse: { type: String },                             
  virements: { type: Number, default: 0 },               
  peffet: { type: Number, default: 0 },                  
  imppeffet: { type: Number, default: 0 }                

});

module.exports = mongoose.model('Banque', banqueSchema);
