import React, { useEffect, useState } from 'react';
import api from '../api';
import { handleError, handleSuccess } from '../utils/toastUtils';
import { ToastContainer } from 'react-toastify';
import {
    User,
    Users,
    Briefcase,
    BarChart2,
    Activity,
    Loader,
    RefreshCw,
    Key
} from 'lucide-react';

const Home = () => {
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminCount: 0
    });
    const [refreshing, setRefreshing] = useState(false);

    // Charger les données de l'utilisateur à partir du localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        } else {
            setLoading(false);
        }
    }, []);

    // Charger les données utilisateur et les stats après que userData est défini
    useEffect(() => {
        if (userData) {
            // Le super admin et l'admin peuvent voir les statistiques et la liste des utilisateurs
            if (['super-admin', 'admin'].includes(userData.role)) {
                fetchUsers();
                fetchStats();
            } else {
                setLoading(false);
            }
        }
    }, [userData]);

    const fetchUsers = async () => {
        try {
            setRefreshing(true);
            const { data } = await api.get('/users');
            setUsers(data);
            setRefreshing(false);
            setLoading(false);
        } catch (error) {
            handleError(error.response?.data?.message || error.message);
            setRefreshing(false);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/users/stats');
            setStats({
                totalUsers: data.totalUsers,
                activeUsers: data.activeUsers,
                adminCount: data.adminCount
            });
        } catch (error) {
            handleError("Erreur lors du chargement des statistiques");
        }
    };

    // ⚠️ Fonction de réinitialisation de mot de passe
    const handleResetPassword = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
            try {
                // Création d'une nouvelle route côté backend pour cette action
                await api.post(`/users/${userId}/reset-password`);
                handleSuccess("Mot de passe réinitialisé avec succès !");
            } catch (error) {
                handleError(error.response?.data?.message || error.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Bienvenue, {userData?.name || 'Cher Utilisateur'} 👋
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {['super-admin', 'admin'].includes(userData?.role)
                            ? "Vous avez accès au tableau de bord administrateur"
                            : "Consultez vos informations et activités récentes"}
                    </p>
                </div>

                {['super-admin', 'admin'].includes(userData?.role) && (
                    <button
                        onClick={() => { fetchUsers(); fetchStats(); }}
                        disabled={refreshing}
                        className={`mt-4 md:mt-0 flex items-center px-4 py-2 rounded-lg ${
                            refreshing
                                ? 'bg-gray-200 text-gray-500'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                    >
                        <RefreshCw size={18} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                )}
            </div>

            {['super-admin', 'admin'].includes(userData?.role) ? (
                <>
                    {/* Cartes de statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Users className="text-blue-600" size={24} />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Utilisateurs Totaux</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border border-green-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Activity className="text-green-600" size={24} />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Utilisateurs Actifs</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Key className="text-purple-600" size={24} />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Administrateurs</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.adminCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des utilisateurs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Gestion des Utilisateurs</h2>
                            <p className="text-gray-600 text-sm">Liste complète des utilisateurs du système</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Société</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Users size={40} className="mb-3" />
                                                    <p className="font-medium">Aucun utilisateur trouvé</p>
                                                    <p className="text-sm mt-1">Essayez d'actualiser la liste</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.role === 'super-admin'
                                                            ? 'bg-red-100 text-red-800'
                                                            : user.role === 'admin'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {user.societes && user.societes.length > 0 
                                                        ? user.societes.map(s => s.name).join(', ') 
                                                        : 'Aucune'}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                                    {user.role !== 'super-admin' && ( // Empêcher la réinitialisation du super-admin
                                                        <button
                                                            onClick={() => handleResetPassword(user._id)}
                                                            className="flex items-center text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Key size={16} className="mr-1" />
                                                            <span>Réinit. MDP</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Votre Profil</h2>
                                <div className="flex items-center mb-6">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">{userData?.name}</h3>
                                        <p className="text-gray-600">{userData?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rôle:</span>
                                        <span className="font-medium">{userData?.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Société:</span>
                                        <span className="font-medium">{userData?.societe?.name || 'Aucune'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dernière connexion:</span>
                                        <span className="font-medium">Aujourd'hui</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/3">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Activités Récentes</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-full mt-1">
                                            <BarChart2 size={16} className="text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Rapport mensuel généré</h3>
                                            <p className="text-sm text-gray-500">Il y a 2 heures</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-full mt-1">
                                            <Briefcase size={16} className="text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Nouveau client ajouté</h3>
                                            <p className="text-sm text-gray-500">Hier à 14:30</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-purple-100 p-2 rounded-full mt-1">
                                            <User size={16} className="text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Profil mis à jour</h3>
                                            <p className="text-sm text-gray-500">5 décembre 2023</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions Rapides</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                        <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Briefcase className="text-blue-600" size={20} />
                                        </div>
                                        <span>Ajouter Client</span>
                                    </button>

                                    <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                        <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <BarChart2 className="text-green-600" size={20} />
                                        </div>
                                        <span>Générer Rapport</span>
                                    </button>

                                    <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                        <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <User className="text-purple-600" size={20} />
                                        </div>
                                        <span>Modifier Profil</span>
                                    </button>

                                    <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                        <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Key className="text-red-600" size={20} />
                                        </div>
                                        <span>Changer MDP</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default Home;