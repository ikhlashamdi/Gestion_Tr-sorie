const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../Controllers/AuthController');

// Route pour l'enregistrement
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);

module.exports = router;