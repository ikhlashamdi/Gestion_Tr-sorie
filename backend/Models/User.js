const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
});

// Middleware pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);




// // models/Personel.js
// const mongoose = require('mongoose');

// const personelSchema = new mongoose.Schema({
//   nomPrenom: { type: String, required: true },
//   CIN: String,
//   numCNSS: String,
//   adress: String,
//   dateRecrutement: Date,
//   dateNaissance: Date,
//   qualification: { type: String }, // populate from API
//   service: String,
//   categorie: String, // list from API
//   echelon: String,   // list from API
//   categorieAvance: String,
//   nature: String,
//   debut: Date,
//   fin: Date
// });

// module.exports = mongoose.model('Personel', personelSchema);
