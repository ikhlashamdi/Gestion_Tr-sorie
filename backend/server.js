// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importer mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Connexion à MongoDB en utilisant la variable d'environnement MONGO_URI
const mongo_url = process.env.MONGO_URI;

mongoose.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected...');
    })
    .catch((err) => {
        console.error('MongoDB Connection Error: ', err);
    });

// Votre code d'application ici (serveur, routes, etc.)
// Exemple : démarrer un serveur Express
const express = require('express');
const app = express();

// Exemple d'endpoint
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
