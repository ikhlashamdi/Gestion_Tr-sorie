require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectToDatabase = require('./Models/db');
const cors = require('cors');
const path = require("path");
const bcrypt = require('bcrypt'); // 🔹 Import de bcrypt pour hacher le mot de passe

// Import des modèles
const User = require('./Models/User');
const Company = require('./Models/Company'); 

// Import des routes
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
const companyRoutes = require('./Routes/companyRoutes'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`✅ Un utilisateur est connecté via Socket.IO: ${socket.id}`);
    
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`✅ Utilisateur ${userId} a rejoint sa room.`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Un utilisateur est déconnecté de Socket.IO: ${socket.id}`);
    });
});

app.use(cors());
app.use(express.json());
app.set("io", io);

// ✅ Connexion à MongoDB et initialisation des données
connectToDatabase().then(async () => {
    // 1. Création du SUPER-ADMIN par défaut (s'il n'existe pas)
    const superAdminExists = await User.findOne({ role: 'super-admin' });
    if (!superAdminExists) {
        const passwordHash = await bcrypt.hash("superadmin1234", 10);
        const superAdminUser = new User({
            name: "Super Admin",
            email: "superadmin@gmail.com",
            password: passwordHash,
            role: "super-admin",
            societe: null // ⚠️ Très important : le super-admin n'est lié à aucune société
        });
        await superAdminUser.save();
        console.log("✅ Super-Admin par défaut créé : superadmin@gmail.com / superadmin1234");
    } else {
        console.log("✅ Super-Admin par défaut déjà existant.");
    }

    // 2. Création de la société par défaut
    const companyName = "Société Générale";
    let defaultCompany = await Company.findOne({ name: companyName });
    if (!defaultCompany) {
        defaultCompany = new Company({ name: companyName });
        await defaultCompany.save();
        console.log(`✅ Société par défaut "${companyName}" créée.`);
    }

    // 3. Création de l'ADMIN par défaut (s'il n'existe pas)
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
        const passwordHash = await bcrypt.hash("admin1234", 10);
        const adminUser = new User({
            name: "Admin",
            email: "admin@gmail.com",
            password: passwordHash,
            role: "admin",
            societe: defaultCompany._id // 🔹 L'ID de l'objet Company est utilisé
        });
        await adminUser.save();
        console.log("✅ Admin par défaut créé : admin@gmail.com / admin1234");
    } else {
        console.log("✅ Admin par défaut déjà existant.");
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
app.use('/api/companies', companyRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});