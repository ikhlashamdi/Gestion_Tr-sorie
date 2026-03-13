const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  code: { type: String, required: true },                      // varchar(8), NOT NULL
  rsoc: { type: String },                                      // varchar(100)
  adresse: { type: String },                                   // varchar(500)
  mf: { type: String },                                        // varchar(30)
  tel: { type: String },                                       // varchar(20)
  fax: { type: String },                                       // varchar(20)
  percon1: { type: String },                                   // varchar(50)
  respercon1: { type: String },                                // varchar(50)
  telpercon1: { type: String },                                // varchar(20)
  emailpercon1: { type: String },                              // varchar(60)
  percon2: { type: String },                                   // varchar(50)
  respercon2: { type: String },                                // varchar(50)
  telpercon2: { type: String },                                // varchar(20)
  emailpercon2: { type: String },                              // varchar(60)
  email: { type: String },                                     // varchar(60)
  percon3: { type: String },                                   // varchar(60)
  telpercon3: { type: String },                                // varchar(20)
  emailpercon3: { type: String },                              // varchar(50)
  respercon3: { type: String },                                // varchar(50)
  RC: { type: String },                                        // varchar(25)
  CP: { type: String },                                        // varchar(5)
  RIB: { type: String },                                       // varchar(50)
  banque: { type: String },                                    // varchar(25)
  soldeinit: { type: Number, default: 0.000 },                 // double(12,3)
  mtrap: { type: Number, default: 0.000 },                     // double(12,3)
  coderap: { type: String, default: 'N' },                     // varchar(2)
  rapbe: { type: String, default: '0' },                       // varchar(2)
  soldeinitbe: { type: Number, default: 0 },                   // double
  mtpaiebe: { type: Number, default: 0 },                      // double
  codedomaine: { type: String },                               // varchar(5)
  libdomaine: { type: String },                                // varchar(50)
  tauxret: { type: Number, default: 0 },                       // double
  prod: { type: String, default: '0' },                        // varchar(1)
  numch: { type: String },                                     // varchar(20)
  codebanq: { type: String },                                  // varchar(20)
  libbanq: { type: String },                                   
  montant: { type: Number, default: 0 },                       
});

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
