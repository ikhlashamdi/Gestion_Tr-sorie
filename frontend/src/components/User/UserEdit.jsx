import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { handleError, handleSuccess } from '../../utils/toastUtils';
import { ToastContainer } from 'react-toastify';
import { User, Mail, Key, Briefcase, Save, ArrowLeft } from 'lucide-react';

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'caissier',
    societe: ''
  });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  // Charger les données de l'utilisateur
  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${id}`);
      setFormData({
        name: data.name,
        email: data.email,
        role: data.role,
        societe: data.societe || ''
      });
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
    } catch (error) {
      handleError("Erreur lors du chargement des sociétés.");
    }
  };

  fetchUser();
  fetchCompanies();
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${id}`, formData);
      handleSuccess(data.message);
      navigate('/users'); 
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
      setResetPasswordLoading(true);
      try {
        await api.put(`/users/${id}/reset-password`);
        handleSuccess("Mot de passe réinitialisé avec succès ! Un email a été envoyé à l'utilisateur.");
      } catch (error) {
        handleError(error.response?.data?.message || error.message);
      } finally {
        setResetPasswordLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="mr-1" size={18} />
          Retour
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">
          Modifier l'utilisateur
        </h2>
        <div className="w-24"></div> {/* Pour l'alignement */}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required 
              />
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail className="mr-2 text-gray-500" size={16} />
              Adresse email
            </label>
            <div className="relative">
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required 
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
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
              <select
                name="societe"
                value={formData.societe}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                required
              >
                <option value="" disabled>Sélectionner une société</option>
                {companies.map(company => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15 9.707l-1.414-1.414L10 11.293 6.414 7.707 5 9.121z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            onClick={handleResetPassword}
            disabled={resetPasswordLoading}
            className={`flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors ${
              resetPasswordLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {resetPasswordLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </>
            ) : (
              <>
                <Key className="mr-2" size={18} />
                Réinitialiser le mot de passe
              </>
            )}
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:ml-auto">
            <button 
              type="button"
              onClick={() => navigate('/users')}
              className="flex items-center justify-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium shadow-md hover:from-purple-700 hover:to-indigo-800 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="mr-2" size={18} />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>

      {/* Informations de sécurité */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Sécurité du compte</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>La réinitialisation du mot de passe enverra un email à l'utilisateur</li>
          <li>Les modifications sont appliquées immédiatement</li>
          <li>Vérifiez les permissions accordées par chaque rôle</li>
        </ul>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default UserEdit;