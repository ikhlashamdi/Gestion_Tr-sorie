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
import MouvementCaissePage from './components/mvtCaisse.jsx';
import MvtCaisse from './pages/mvtCaisse';





const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Private Routes */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/caisse" element={<PrivateRoute><Caisse /></PrivateRoute>} />
      <Route path="/nature-charge" element={<PrivateRoute><NatureCharge /></PrivateRoute>} />
      <Route path="/tier" element={<PrivateRoute><Tier /></PrivateRoute>} />
      <Route path="/personnel" element={<PrivateRoute><Personnel /></PrivateRoute>} />
      <Route path="/vehicule" element={<PrivateRoute><VehiculePage /></PrivateRoute>} />
      <Route path="/banque" element={<PrivateRoute><Banque /></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><Client /></PrivateRoute>} />
      <Route path="/clients/add" element={<PrivateRoute><ClientAddPage /></PrivateRoute>} />
      <Route path="/clients/edit/:id" element={<PrivateRoute><ClientEditPage /></PrivateRoute>} />

      <Route path="/fournisseurs" element={<PrivateRoute><Fournisseur /></PrivateRoute>} />
      <Route path="/fournisseurs/ajouter" element={<AjouterFournisseur />} />
      <Route path="/fournisseurs/modifier/:id" element={<ModifierFournisseur />} />   
     <Route path="/mvt-caisse" element={<MvtCaisse />} />     




      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
