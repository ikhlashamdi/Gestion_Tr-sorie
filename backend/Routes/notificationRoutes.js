// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');
const verifyToken = require('../Middlewares/Auth');

// GET /api/notifications/count
// Compte le nombre de notifications non lues pour l'utilisateur connecté
router.get('/count', verifyToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id,
      read: false
    });
    res.status(200).json({ count: unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
});

module.exports = router;