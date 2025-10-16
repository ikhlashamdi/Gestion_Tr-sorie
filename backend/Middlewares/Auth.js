const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token manquant" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate("societes");

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        req.user = {
            _id: user._id,
            id: user._id,
            role: user.role,
            societes: user.societes
        };

        next();
    } catch (err) {
        return res.status(403).json({ message: "Token invalide" });
    }
};

module.exports = verifyToken;
