import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./components/common/NotFound.jsx";
import Caisse from "./pages/Caisse.jsx";
import NatureCharge from "./pages/NatureCharge.jsx";
import Tier from "./pages/Tier.jsx";
import Personnel from "./pages/Personnel.jsx";
import Banque from "./pages/Banque.jsx";
import VehiculePage from './pages/VehiculePage.jsx';
import ClientAddPage from './components/Client/ClientAddPage';
import ClientEditPage from './components/Client/ClientEditPage';
import Client from './pages/Client';
import ModifierFournisseur from './components/Fournisseur/ModifierFournisseur.jsx';
import AjouterFournisseur from './components/Fournisseur/AjouterFournisseur.jsx';
import Fournisseur from './pages/fournisseur.jsx';
import MvtCaisse from './pages/mvtCaisse';
import Journaux from './pages/Journaux.jsx';
import ProfileUser from './pages/ProfileUser.jsx';
import ProfileImageUpload from './components/profile/ProfileImageUpload.jsx';
import ProfilePasswordChange from './components/profile/ProfilePasswordChange.jsx';
import CaisseFormPage from './components/Caisse/CaisseFormPage.jsx';
import NatureChargeFormPage from './components/NatureDeCharge/NatureChargeFormPage.jsx';
import Layout from "./components/common/Layout";
import TierFormPage from './components/Tier/TierFormPage.jsx';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>

      {/* ✅ Redirection vers login par défaut */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 🟢 Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔐 Protected Routes dans Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

        <Route path="home" element={<Home />} />
        <Route path="caisse" element={<Caisse />} />
        <Route path="nature-charge" element={<NatureCharge />} /> 
        <Route path="nature-charges/nouveau" element={<NatureChargeFormPage />} />
        <Route path="nature-charges/:id" element={<NatureChargeFormPage />} />

        <Route path="tier" element={<Tier />} />
        <Route path="tiers/nouveau" element={<TierFormPage />} />
        <Route path="tiers/:id" element={<TierFormPage />} />

        <Route path="personnel" element={<Personnel />} />
        <Route path="vehicule" element={<VehiculePage />} />
        <Route path="banque" element={<Banque />} />

        {/* Clients */}
        <Route path="clients" element={<Client />} />
        <Route path="clients/add" element={<ClientAddPage />} />
        <Route path="clients/edit/:id" element={<ClientEditPage />} />

        {/* Fournisseurs */}
        <Route path="fournisseurs" element={<Fournisseur />} />
        <Route path="fournisseurs/ajouter" element={<AjouterFournisseur />} />
        <Route path="fournisseurs/modifier/:id" element={<ModifierFournisseur />} />

        {/* Caisses */}
        <Route path="caisses/nouveau" element={<CaisseFormPage />} />
        <Route path="caisses/:id" element={<CaisseFormPage />} />

        {/* Mouvements & Journaux */}
        <Route path="mvt-caisse" element={<MvtCaisse />} />
        <Route path="journal-caisse" element={<Journaux />} />

        {/* Profil */}
        <Route path="profile" element={<ProfileUser />} />
        <Route path="profile/password" element={<ProfilePasswordChange />} />
        <Route path="profile/image" element={<ProfileImageUpload />} />

      </Route>

      {/* page Not Found */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;
