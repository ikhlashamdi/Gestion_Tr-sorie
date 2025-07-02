import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";

import Signup from "./pages/Signup";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Hook pour la navigation
  const location = useLocation();

  // Vérifie si un token existe dans le localStorage lors du montage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Convertit la présence du token en booléen
  }, []);

  // Fonction pour protéger les routes
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  // Liste des routes sans Navbar ni Sidebar
  const noHeaderRoutes = ["/login", "/signup"];

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprime le token
    setIsAuthenticated(false); // Met à jour l'état d'authentification
    navigate("/login", { replace: true }); // Redirige vers la page de connexion
  };

  return (
    <div className="App">
      {/* Affiche Navbar et Sidebar seulement si la route actuelle n'est pas dans noHeaderRoutes */}
      {!noHeaderRoutes.includes(location.pathname) && <></>}

      {/* Corps principal de l'application */}
      <div className="content">
        <Routes>
          {/* Redirection de la racine vers la page appropriée */}

          {/* Page de connexion, redirige vers /home si l'utilisateur est déjà authentifié */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Page d'inscription, redirige vers /home si l'utilisateur est déjà authentifié */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
