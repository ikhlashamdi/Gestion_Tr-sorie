const express = require("express");
const router = express.Router();
const verifyToken = require("../Middlewares/Auth"); 
const checkRole = require("../Middlewares/roleMiddleware"); 
const Company = require("../Models/Company");

router.post('/', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const { name, address } = req.body;
        const company = new Company({ name, address });
        await company.save();
        res.status(201).json({ message: "Société créée avec succès", company });
    } catch (err) {
        if (err.name === 'ValidationError' || err.code === 11000) {
            return res.status(400).json({ message: "Les données fournies sont invalides.", error: err.message });
        }
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});


router.get('/', verifyToken, checkRole(['super-admin', 'admin', 'responsable', 'caissier']), async (req, res) => {
    try {
        let companies;

        if (req.user.role === 'super-admin') {
            companies = await Company.find();
        } else {
            companies = await Company.find({ _id: { $in: req.user.societes } });
        }

        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.get('/:id', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Société non trouvée" });
        }

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

router.put('/:id', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const { name, address } = req.body;
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            { name, address }, 
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: "Société non trouvée" });
        }
        res.status(200).json({ message: "Société mise à jour avec succès", company: updatedCompany });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Données de mise à jour invalides.", error: error.message });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


router.delete('/:id', verifyToken, checkRole(['super-admin']), async (req, res) => {
    try {
        const deletedCompany = await Company.findByIdAndDelete(req.params.id);

        if (!deletedCompany) {
            return res.status(404).json({ message: "Société non trouvée" });
        }
        res.status(200).json({ message: "Société supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router;
