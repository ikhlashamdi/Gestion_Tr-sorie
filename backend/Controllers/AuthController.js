const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../Middlewares/AuthValidation');

// Enregistrer un utilisateur
const registerUser = async (req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant' });

        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: 'Utilisateur enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// Connecter un utilisateur
const loginUser = async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const user = await User.findOne({ email: req.body.email });

        // 🔐 Étape 1 : Vérifier si l'utilisateur existe ET si le mot de passe est valide.
        // On combine les deux vérifications pour éviter de donner trop d'indices.
        if (!user || !await user.comparePassword(req.body.password)) {
            // Renvoyer un message générique pour des raisons de sécurité
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // ✅ Étape 2 : Si l'utilisateur est authentifié, générer le token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // 🧹 Nettoyer l'objet utilisateur avant de l'envoyer
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({ message: 'Connexion réussie', token, user: userWithoutPassword });

    } catch (error) {
        // En cas d'erreur serveur inattendue
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

module.exports = { registerUser, loginUser };

