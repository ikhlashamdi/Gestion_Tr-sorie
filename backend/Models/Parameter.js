const mongoose = require('mongoose');

const personnelParamSchema = new mongoose.Schema({
    nombreDeMoins: Number,
    TFP: Number,
    foprolos: Number,
    cnss: Number,
    fonctionPro: String,
    tauxAcc: Number,
    CSS: Number
}, { _id: false });

const socParamSchema = new mongoose.Schema({
    chefFamille: Number,
    enfant1: Number,
    enfant2: Number,
    enfant3: Number,
    enfant4: Number,
    enfantAnticipe: Number,
    enfantNonBoursable: Number
}, { _id: false });

const intervalParamSchema = new mongoose.Schema({
    salaireBas: Number,
    maxSal: Number,
    pourcentage: Number
}, { _id: false });

const parameterSchema = new mongoose.Schema({
    code: { type: String },
    raisonSocial: String,
    numCNSS: String,
    adress: String,
    societeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Societe' },
    personnelParams: personnelParamSchema,
    socParams: socParamSchema,
    intervalParams: intervalParamSchema
});

module.exports = mongoose.model('Parameter', parameterSchema);
