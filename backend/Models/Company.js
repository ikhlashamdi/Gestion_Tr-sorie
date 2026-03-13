const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
   code: { type: String, default: () => Math.random().toString(36).substring(2, 10) },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    address: {
    type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Company', CompanySchema);