const express = require('express');
const router = express.Router();
const MvtCaisse = require('../Models/MvtCaisse');

// POST /api/mouvements
router.post('/', async (req, res) => {
try {
const mouvement = new MvtCaisse(req.body);
await mouvement.save();
res.status(201).json({ message: "Mouvement enregistré", mouvement });
} catch (err) {
console.error("Erreur création mouvement:", err);
res.status(500).json({ error: "Erreur serveur", details: err.message });
}
});

module.exports = router;