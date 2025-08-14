require('dotenv').config();
const express = require('express');
const connectToDatabase = require('./Models/db');
const cors = require('cors');
const path = require("path");
const authRouter = require('./Routes/AuthRouter');
const caisseRoutes = require('./Routes/caisseRoutes');
const natureChargeRoutes = require('./Routes/natureChargeRoutes');
const tierRoutes = require('./Routes/tierRoutes');
const personnelRoutes = require('./Routes/personnelRoutes');
const banqueRoutes = require('./Routes/banqueRoutes');
const vehiculeRoutes = require('./Routes/VehiculeRoutes');
const clientRoutes = require('./Routes/clientRoutes');
const userRoutes = require("./Routes/userRoutes");
const fournisseurRoutes = require('./Routes/fournisseurRoutes');
const tiersRouter = require('./Routes/tiersR');
const mouvementsRoutes = require('./Routes/mouvementRoutes');
const rapportRoutes = require("./Routes/rapports");
const transfertRoutes = require("./Routes/transfertRoutes");

const app = express();

// ✅ Autoriser CORS pour toutes les origines
app.use(cors());

// ✅ Middleware pour lire JSON
app.use(express.json());

// ✅ Connexion à MongoDB
connectToDatabase();

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/caisses', caisseRoutes);
app.use('/api/nature-charges', natureChargeRoutes);
app.use('/api/autre', tierRoutes);
app.use('/api/personnels', personnelRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/banques', banqueRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/mouvements', require('./Routes/mouvementRoutes'));
app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/tiers', tiersRouter);
app.use("/api/users", userRoutes);
app.use('/api/mouvements', mouvementsRoutes);
app.use("/api/rapports", rapportRoutes);
app.use("/api/transferts", transfertRoutes);
// ✅ Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
