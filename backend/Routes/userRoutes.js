const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/upload");
const verifyToken = require("../Middlewares/Auth");
const userController = require("../Controllers/userController");
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const checkAdmin = require('../Middlewares/checkAdmin');
const { sendUserCreatedEmail } = require("../Services/emailService");

router.post("/change-password", verifyToken, userController.changePassword);
router.post("/upload-image", verifyToken, upload.single("image"), userController.uploadImage);
router.get("/me", verifyToken, userController.getCurrentUser);

// 📌 Création d'un utilisateur par l'admin
router.post('/create', verifyToken, checkAdmin, async (req, res) => {
    try {
        const { name, email, password, role, societe } = req.body;
        
        // Vérifie si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Crée l'utilisateur avec le mot de passe fourni
        const newUser = new User({ name, email, password, role, societe });
        await newUser.save();

        // 🎉🎉 MODIFICATION ICI 🎉🎉
        // On envoie le mot de passe en clair à l'emailService
        // Le modèle Mongoose se chargera de le hacher automatiquement avant de le sauvegarder
        try {
            await sendUserCreatedEmail(email, name, password); 
            console.log(`✅ Email envoyé à ${email}`);
        } catch (emailError) {
            console.error(`⚠️ Échec d'envoi de l'email à ${email} :`, emailError.message);
        }

        // Réponse API
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: newUser
        });

    } catch (error) {
        console.error("Erreur serveur:", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


// 📌 Récupérer tous les utilisateurs (réservé à l'admin)
router.get('/', verifyToken, checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // On enlève le mot de passe
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});
router.get('/stats', verifyToken, checkAdmin, async (req, res) => {
    try {
        // Compter le nombre total d'utilisateurs
        const totalUsers = await User.countDocuments();
        
        // Compter le nombre d'utilisateurs avec le rôle 'admin'
        const adminCount = await User.countDocuments({ role: 'admin' });

        // NOTE : Le concept d'utilisateurs "actifs" n'est pas défini dans le modèle.
        // Pour l'instant, on va considérer que tous les utilisateurs sont "actifs" ou utiliser un champ.
        // Si vous avez un champ 'lastLogin' par exemple, vous pouvez le modifier ainsi :
        // const activeUsers = await User.countDocuments({ lastLogin: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
        const activeUsers = totalUsers; // Placeholder

        res.json({ totalUsers, activeUsers, adminCount });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

router.get('/:id', verifyToken, checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.put('/:id', verifyToken, checkAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role, societe } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role, societe },
            { new: true, runValidators: true } // {new: true} renvoie le document mis à jour, {runValidators: true} exécute les validateurs
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router;