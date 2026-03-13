import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { User, Mail, Lock, Building2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    societe: '',
    role: 'caissier'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, societe, role } = signupInfo;

    if (!name || !email || !password || !societe || !role) {
      toast.error('Tous les champs sont requis.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupInfo),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Une erreur est survenue.');
        return;
      }

      if (result.success) {
        toast.success('Inscription réussie ! Redirection vers la connexion...');
        navigate('/login');
      } else {
        toast.error(result.message || 'Une erreur est survenue.');
      }
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error);
      toast.error('Impossible de se connecter au serveur.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="bg-white/70 backdrop-blur-md border border-gray-200 shadow-2xl p-10 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-4">
          Créer un compte
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Remplissez les informations ci-dessous pour vous inscrire
        </p>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Nom */}
          <div className="relative">
            <User className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="name"
              type="text"
              name="name"
              value={signupInfo.name}
              onChange={handleChange}
              placeholder="Nom complet"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Société */}
          <div className="relative">
            <Building2 className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="societe"
              type="text"
              name="societe"
              value={signupInfo.societe}
              onChange={handleChange}
              placeholder="Nom de la société"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              name="email"
              value={signupInfo.email}
              onChange={handleChange}
              placeholder="Adresse e-mail"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <Lock className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="password"
              type="password"
              name="password"
              value={signupInfo.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Rôle */}
          <div className="relative">
            <select
              id="role"
              name="role"
              value={signupInfo.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200 bg-white text-gray-700"
            >
              <option value="" disabled>Choisir un rôle</option>
              <option value="caissier">Caissier</option>
              <option value="responsable">Responsable</option>
            </select>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-lg py-3 shadow-lg transform hover:scale-[1.02] transition duration-200"
          >
            S'inscrire
          </button>

          {/* Lien vers connexion */}
          <p className="text-center text-gray-600 text-base mt-3">
            Vous avez déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Signup;
