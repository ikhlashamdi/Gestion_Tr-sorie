require('dotenv').config();
const express = require('express');
const http = require('http'); // 🔹 Importation du module http
const { Server } = require('socket.io'); // 🔹 Importation de Server depuis socket.io
const connectToDatabase = require('./Models/db');
const cors = require('cors');
const path = require("path");

// Import modèles et routes
const User = require('./Models/User');
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
const notificationRoutes = require('./Routes/notificationRoutes');

const app = express();

// 🔹 Crée une instance de serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// 🔹 Configure l'instance de Socket.IO et l'attache au serveur HTTP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 🔹 Gère les connexions Socket.IO
io.on('connection', (socket) => {
    console.log(`✅ Un utilisateur est connecté via Socket.IO: ${socket.id}`);
    
    // Votre logique de socket existante irait ici
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`✅ Utilisateur ${userId} a rejoint sa room.`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Un utilisateur est déconnecté de Socket.IO: ${socket.id}`);
    });
});

// ✅ Autoriser CORS pour toutes les origines
app.use(cors());

// ✅ Middleware pour lire JSON
app.use(express.json());

// 💡 Passe l'instance de 'io' à l'application Express
app.set("io", io);

// ✅ Connexion à MongoDB
connectToDatabase().then(async () => {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
        const adminUser = new User({
            name: "Admin",
            email: "admin@gmail.com",
            password: "admin1234",
            role: "admin",
            societe: "Société Générale"
        });
        await adminUser.save();
        console.log("✅ Admin par défaut créé : admin@gmail.com / admin1234");
    } else {
        console.log("✅ Admin déjà existant");
    }
});

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
app.use('/api/notifications', notificationRoutes);

// ✅ Démarrer le serveur HTTP et Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
