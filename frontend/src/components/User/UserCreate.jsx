import React, { useState } from 'react';
import api from '../../api';
import { handleError, handleSuccess } from '../../utils/toastUtils';
import { ToastContainer } from 'react-toastify';
import { User, Lock, Eye, EyeOff, Briefcase, Key, UserPlus } from 'lucide-react';

function UserCreate() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'caissier',
    societe: 'Société Générale'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calcul de la force du mot de passe
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    calculatePasswordStrength(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/users/create', formData);
      handleSuccess(data.message);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'caissier', 
        societe: 'Société Générale' 
      });
      setPasswordStrength(0);
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength < 3) return 'bg-red-500';
    if (passwordStrength < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return 'Non défini';
    if (passwordStrength < 3) return 'Faible';
    if (passwordStrength < 5) return 'Moyen';
    return 'Fort';
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="text-purple-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Ajouter un nouvel utilisateur</h2>
        <p className="text-gray-600 mt-2">
          Créez un compte pour un membre de votre équipe
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom complet */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="mr-2 text-gray-500" size={16} />
              Nom complet
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Prénom et Nom" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required 
              />
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-gray-500 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Adresse email
            </label>
            <div className="relative">
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@exemple.com" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required 
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Lock className="mr-2 text-gray-500" size={16} />
              Mot de passe
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required 
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Force du mot de passe */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Force du mot de passe:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 3 ? 'text-red-600' : 
                    passwordStrength < 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPasswordStrengthColor()}`} 
                    style={{ width: `${passwordStrength * 20}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-gray-500 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Rôle utilisateur
            </label>
            <div className="relative">
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="admin">Administrateur</option>
                <option value="responsable">Responsable</option>
                <option value="caissier">Caissier</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Société */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Briefcase className="mr-2 text-gray-500" size={16} />
              Société
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="societe" 
                value={formData.societe} 
                onChange={handleChange} 
                placeholder="Nom de la société" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              />
              <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            type="button"
            onClick={generatePassword}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors font-medium"
          >
            <Key className="mr-2" size={18} />
            Générer un mot de passe
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium shadow-md hover:from-purple-700 hover:to-indigo-800 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <UserPlus className="mr-2" size={18} />
                Créer l'utilisateur
              </>
            )}
          </button>
        </div>
      </form>

      {/* Informations importantes */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Bonnes pratiques</h3>
        <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
          <li>Utilisez un mot de passe fort contenant au moins 8 caractères</li>
          <li>Attribuez les rôles avec prudence (administrateur = accès complet)</li>
          <li>Communiquez les identifiants de manière sécurisée</li>
        </ul>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default UserCreate;