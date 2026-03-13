const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    profileImage: { type: String, default: "" },
    role: {
        type: String,
        enum: ["super-admin", "admin", "responsable", "caissier"],
        required: true
    },
    societes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }]
});

UserSchema.pre('validate', function (next) {
    if (this.role !== 'super-admin' && (!this.societes || this.societes.length === 0)) {
        this.invalidate('societes', 'Au moins une société est requise pour ce rôle.');
    }
    next();
});


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

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
