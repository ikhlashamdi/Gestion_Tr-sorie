import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils/toastUtils';
import { Mail, Lock } from 'lucide-react';

function Login({ setIsAuthenticated }) {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleError('Email et mot de passe requis');
    }

    try {
      const url = `http://localhost:5000/api/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
      });

      const result = await response.json();
      const { message, token, user, error } = result;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (setIsAuthenticated) setIsAuthenticated(true);
        handleSuccess('Connexion réussie !');

        navigate('/home');
      } else {
        handleError(error?.details?.[0]?.message || message || 'Échec de connexion.');
      }
    } catch (err) {
      handleError(err.message || 'Erreur inattendue.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="bg-white/70 backdrop-blur-md border border-gray-200 shadow-2xl p-10 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Connexion
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Entrez vos identifiants pour accéder à votre compte
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Champ Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              placeholder="Adresse e-mail"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="relative">
            <Lock className="absolute left-3 top-4 text-gray-400" size={20} />
            <input
              id="password"
              type="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-lg py-3 shadow-lg transform hover:scale-[1.02] transition duration-200"
          >
            Se connecter
          </button>

          {/* Lien vers l'inscription */}
          <p className="text-center text-gray-600 text-base mt-3">
            Pas encore de compte ?{' '}
            <Link
              to="/signup"
              className="text-indigo-600 font-semibold hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
