const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/upload");
const verifyToken = require("../Middlewares/Auth");
const userController = require("../Controllers/userController");
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const checkRole = require('../Middlewares/roleMiddleware'); 
const { sendUserCreatedEmail } = require("../Services/emailService");

router.post("/change-password", verifyToken, userController.changePassword);
router.post("/upload-image", verifyToken, upload.single("image"), userController.uploadImage);
router.get("/me", verifyToken, userController.getCurrentUser);


router.post('/create', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        const { name, email, password, role, societes } = req.body;
        const currentUserRole = req.user.role;
        const currentUserSocietes = req.user.societes || [];

   
        if (currentUserRole === 'admin') {
            if (role === 'super-admin' || role === 'admin') {
                return res.status(403).json({ message: "Un administrateur ne peut créer qu'un responsable ou un caissier." });
            }
            // Admin ne peut créer que dans ses sociétés
            const invalidSociete = societes.some(s => !currentUserSocietes.includes(s));
            if (invalidSociete) {
                return res.status(403).json({ message: "Un administrateur ne peut créer des utilisateurs que dans ses sociétés." });
            }
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé" });

        const newUser = new User({ name, email, password, role, societes });
        await newUser.save();

        try {
            await sendUserCreatedEmail(email, name, password);
        } catch (emailError) {
            console.error(`Échec d'envoi de l'email à ${email} :`, emailError.message);
        }

        res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
    } catch (error) {
        console.error("Erreur serveur:", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.get('/', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query = { societes: { $in: req.user.societes } };
        }
        const users = await User.find(query).populate('societes').select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Statistiques
router.get('/stats', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query = { societes: { $in: req.user.societes } };
        }

        const totalUsers = await User.countDocuments(query);
        const adminCount = await User.countDocuments({ ...query, role: 'admin' });
        const activeUsers = totalUsers; // Placeholder

        res.json({ totalUsers, activeUsers, adminCount });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.get('/:id', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('societes').select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        if (req.user.role === 'admin') {
const userSocietesIds = req.user.societes.map(s => s._id.toString());
const intersection = user.societes.map(s => s._id.toString()).some(id => userSocietesIds.includes(id));
            if (!intersection) return res.status(403).json({ message: "Accès refusé." });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.put('/:id', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        const { name, email, role, societes } = req.body;
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) return res.status(404).json({ message: "Utilisateur non trouvé" });

        if (req.user.role === 'admin') {
            const intersection = userToUpdate.societes.map(s => s.toString()).some(s => req.user.societes.includes(s));
            if (!intersection) return res.status(403).json({ message: "Accès refusé." });

            if (userToUpdate.role === 'super-admin' && role !== 'super-admin') {
                return res.status(403).json({ message: "Un administrateur ne peut pas modifier un super-admin." });
            }

            // Vérifier que l’admin ne peut assigner que ses sociétés
            const invalidSociete = societes.some(s => !req.user.societes.includes(s));
            if (invalidSociete) return res.status(403).json({ message: "Un administrateur ne peut assigner que ses sociétés." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, societes },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});
router.get('/societes/:ids', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
  try {
    const idsParam = req.params.ids;
    if (!idsParam) return res.status(400).send({ error: "IDs de sociétés requis" });

    const societeIds = idsParam.split(',').map(id => id.trim());
    

    const users = await User.find({ societes: { $in: societeIds } }).select('name role societes');

    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Erreur serveur", details: err.message });
  }
});


router.delete('/:id', verifyToken, checkRole(['super-admin', 'admin']), async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: "Utilisateur non trouvé" });

        if (req.user.role === 'admin') {
            const intersection = userToDelete.societes.map(s => s.toString()).some(s => req.user.societes.includes(s));
            if (!intersection) return res.status(403).json({ message: "Accès refusé." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression :", error.message);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router;
