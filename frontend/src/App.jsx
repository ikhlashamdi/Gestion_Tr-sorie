import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./components/common/NotFound.jsx";
import Journaux from "./pages/Journaux.jsx";
import Compte from "./pages/Compte.jsx";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Authenticated-like Routes (using PrivateRoute for structure, but no actual auth check here) */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/journaux" element={<PrivateRoute><Journaux /></PrivateRoute>} />
      <Route path="/compte" element={<PrivateRoute><Compte /></PrivateRoute>} />

      {/* unknown paths */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
