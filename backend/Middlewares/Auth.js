const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token invalide' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        req.user = user; // 🔹 On met directement l'objet utilisateur
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token invalide' });
    }
};


module.exports = verifyToken;
