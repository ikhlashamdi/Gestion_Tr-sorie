import React, { useEffect, useState } from 'react';
import api from '../api';
import { handleError, handleSuccess } from '../utils/toastUtils';
import { ToastContainer } from 'react-toastify';
import {
    Users,
    Activity,
    Loader,
    RefreshCw,
    Key,
    Landmark,
    Banknote,
    ArrowRightLeft,
    PlusCircle,
    MinusCircle,
    Clock,
    BarChart2 
} from 'lucide-react';
// Import des composants Recharts pour le graphique
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Home = () => {
    // États pour l'utilisateur et le chargement
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // États pour les administrateurs
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminCount: 0
    });
    
    // États pour le caissier
    const [caisses, setCaisses] = useState([]);
    const [activeCaisse, setActiveCaisse] = useState(null);
    const [caisseSolde, setCaisseSolde] = useState(0);
    const [recentMvts, setRecentMvts] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    // 🆕 NOUVEL ÉTAT : Pour les statistiques journalières (graphique)
    const [dailyStats, setDailyStats] = useState([]);
    const [loadingDailyStats, setLoadingDailyStats] = useState(false);


    // #########################################
    // # 1. EFFETS ET LOGIQUE DE CHARGEMENT
    // #########################################

    // Charger l'utilisateur depuis le localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        } else {
            setLoading(false);
        }
    }, []);

    // Charger les données initiales selon le rôle
    useEffect(() => {
        if (userData) {
            if (['super-admin', 'admin'].includes(userData.role)) {
                fetchUsers();
                fetchStats();
            } else {
                fetchCaissesForUser(userData._id);
            }
        }
    }, [userData]);

    // Charger le solde, les mouvements récents et les stats journalières quand la caisse active change
    useEffect(() => {
        if (activeCaisse) {
            fetchCaisseSolde(activeCaisse._id);
            fetchRecentMvts(activeCaisse._id);
            fetchDailyStats(activeCaisse._id); // 🆕
        } else {
            setCaisseSolde(0);
            setRecentMvts([]); 
            setDailyStats([]); // 🆕
        }
    }, [activeCaisse]);


    // #########################################
    // # 2. FONCTIONS DE RÉCUPÉRATION (FETCH)
    // #########################################

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            handleError("Erreur lors du chargement des utilisateurs.");
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/users/stats');
            setStats(data);
            setLoading(false);
        } catch (error) {
            handleError("Erreur lors du chargement des statistiques.");
            setLoading(false);
        }
    };

    const fetchCaissesForUser = async (userId) => {
        try {
            const { data } = await api.get(`/caisses/by-user/${userId}`);
            setCaisses(data);
            
            if (data.length > 0) {
                setActiveCaisse(data[0]);
            } else {
                setLoading(false); 
            }
        } catch (error) {
            handleError("Erreur lors du chargement de vos caisses.");
            setLoading(false);
        }
    };
    
    const fetchCaisseSolde = async (caisseId) => {
        try {
            const { data } = await api.get(`/caisses/${caisseId}/solde`);
            setCaisseSolde(data.soldeCalcule || 0);
            // Remarque : On ne met plus setLoading(false) ici.
        } catch (error) {
            handleError("Erreur lors du chargement du solde.");
            setCaisseSolde(0);
        }
    };

    const fetchRecentMvts = async (caisseId) => {
        setLoadingRecent(true);
        try {
            const { data } = await api.get(`/mouvements/recent/${caisseId}`); 
            setRecentMvts(data);
        } catch (error) {
            console.error("Erreur de récupération des mouvements récents:", error);
        } finally {
            setLoadingRecent(false);
        }
    };

    // 🆕 FONCTION POUR RÉCUPÉRER LES STATS JOURNALIÈRES POUR LE GRAPHIQUE
    const fetchDailyStats = async (caisseId) => {
        setLoadingDailyStats(true);
        try {
            // Requête pour les 7 derniers jours par exemple
            const { data } = await api.get(`/mouvements/daily-summary/${caisseId}?days=30`);
            setDailyStats(data);
        } catch (error) {
            console.error("Erreur de récupération des stats journalières:", error);
        } finally {
            setLoadingDailyStats(false);
            setLoading(false); // S'assurer que le chargement global se termine ici pour le caissier
        }
    };

    // #########################################
    // # 3. GESTION DES ÉVÉNEMENTS
    // #########################################

    const handleCaisseChange = (e) => {
        const selectedId = e.target.value;
        const newActiveCaisse = caisses.find(c => c._id === selectedId);
        setActiveCaisse(newActiveCaisse);
        // Le useEffect s'occupe de recharger le solde et les mouvements/stats
    };

    const handleResetPassword = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
            try {
                await api.post(`/users/${userId}/reset-password`);
                handleSuccess("Mot de passe réinitialisé avec succès !");
            } catch (error) {
                handleError("Erreur lors de la réinitialisation du mot de passe.");
            }
        }
    };

    // Fonction pour afficher le nom du Tiers (inchangée)
    const getTierName = (tier) => {
        if (!tier) return 'N/A';
        return tier.libelle || tier.rsoc || tier.nomComplet || tier.raisonSociale || 'Tier Inconnu';
    }


    // #########################################
    // # 4. RENDER
    // #########################################

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
                            : "Gérez vos caisses quotidiennes"}
                    </p>
                </div>

                {/* Bouton Actualiser (Admin) */}
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

            {/* VUE ADMIN */}
            {['super-admin', 'admin'].includes(userData?.role) ? (
                <>
                    {/* Cartes de statistiques (Admin) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* ... (Cartes de stats admin - Inchangées) ... */}
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

                    {/* Tableau des utilisateurs (Admin) */}
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
                                                    {user.role !== 'super-admin' && (
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
                /* VUE CAISSIER */
                <div className="space-y-6">
                    {/* 1. SÉLECTEUR DE CAISSE ET SOLDE ACTUEL */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-1/2">
                            <Landmark size={32} className="text-purple-600 flex-shrink-0" />
                            <div className="w-full">
                                <label htmlFor="caisse-select" className="block text-xs font-medium text-gray-500 uppercase">
                                    Caisse Active
                                </label>
                                <select
                                    id="caisse-select"
                                    onChange={handleCaisseChange}
                                    value={activeCaisse?._id || ''}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md font-semibold"
                                >
                                    {caisses.length > 0 ? (
                                        caisses.map(caisse => (
                                            <option key={caisse._id} value={caisse._id}>
                                                {caisse.libelle || caisse.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Aucune caisse assignée</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="w-full sm:w-1/2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-semibold text-gray-700">Solde Actuel</h3>
                                <Banknote size={24} className="text-purple-700" />
                            </div>
                            <p className="text-3xl font-bold text-purple-900 mt-1">
                                {activeCaisse ? `${caisseSolde.toFixed(2)}` : '0.00'} DT
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {activeCaisse ? `Dernière mise à jour à ${new Date().toLocaleTimeString()}` : 'Sélectionnez une caisse'}
                            </p>
                        </div>
                    </div>

                    {/* 🆕 2. GRAPHIQUE DE LA TENDANCE JOURNALIÈRE */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <BarChart2 className="mr-2" size={20} />
                            Tendance des Mouvements (30 Jours)
                        </h2>
                        
                        {!activeCaisse && (
                            <p className="mt-2 text-center text-gray-500">Sélectionnez une caisse pour voir son historique.</p>
                        )}

                        {activeCaisse && loadingDailyStats ? (
                             <div className="flex justify-center py-12">
                                <Loader className="animate-spin text-purple-600" size={24} />
                            </div>
                        ) : activeCaisse && dailyStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={dailyStats}
                                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    {/* Affiche le jour/mois en bas */}

<XAxis 
    dataKey="date" 
    stroke="#6b7280" 
    // 💡 Ajout de l'index pour espacer les étiquettes
    tickFormatter={(date, index) => {
        if (index % 5 !== 0) return ''; // N'affiche qu'une étiquette sur cinq
        const parts = date.split('-');
        return `${parts[2]}/${parts[1]}`; 
    }} 
/>                                   {/* Affiche les montants en Kilos pour compacter */}
                                    <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`} /> 
                                    <Tooltip 
                                        formatter={(value, name) => [`${value.toFixed(2)} DT`, name === 'encaissements' ? 'Encaissements' : 'Décaissements']} 
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                    />
                                    <Legend formatter={(value) => value === 'encaissements' ? 'Encaissements' : 'Décaissements'} />
                                    <Bar dataKey="encaissements" fill="#10b981" name="Encaissements" /> {/* Vert */}
                                    <Bar dataKey="decaissements" fill="#ef4444" name="Décaissements" /> {/* Rouge */}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : activeCaisse && (
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-600 text-sm">Aucune donnée de mouvement récente pour cette caisse.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* 3. ACTIONS RAPIDES */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <ActionButton 
                            icon={PlusCircle} 
                            label="Nouveau Encaissement" 
                            color="green"
                            link={`/mvt-caisse/new?type=entree&caisseId=${activeCaisse?._id}`}
                            disabled={!activeCaisse}
                        />
                        <ActionButton 
                            icon={MinusCircle} 
                            label="Nouveau Décaissement" 
                            color="red" 
                            link={`/mvt-caisse/new?type=sortie&caisseId=${activeCaisse?._id}`}
                            disabled={!activeCaisse}
                        />
                        <ActionButton 
                            icon={ArrowRightLeft} 
                            label="Transfert de Fonds" 
                            color="blue"
                            link="/transfert/nouveau"
                            disabled={!activeCaisse}
                        />
                        <ActionButton 
                            icon={Clock} 
                            label="Historique Mouvements" 
                            color="orange"
                            link={`/journal-caisse?caisseId=${activeCaisse?._id}`}
                            disabled={!activeCaisse}
                        />
                    </div>

                    {/* 4. VUE D'ENSEMBLE (Mouvements Récents) */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mouvements Récents (Caisse Active)</h2>
                        
                        {!activeCaisse && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    Veuillez sélectionner une caisse pour voir les mouvements récents.
                                </p>
                            </div>
                        )}

                        {activeCaisse && loadingRecent && (
                            <div className="flex justify-center py-8">
                                <Loader className="animate-spin text-purple-600" size={24} />
                            </div>
                        )}

                        {activeCaisse && !loadingRecent && recentMvts.length === 0 && (
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-600 text-sm">
                                    Pas de mouvements récents (validés) trouvés pour cette caisse.
                                </p>
                            </div>
                        )}

                        {activeCaisse && !loadingRecent && recentMvts.length > 0 && (
                            <ul className="divide-y divide-gray-200 mt-4">
                                {recentMvts.map(mvt => (
                                    <li key={mvt._id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors">
                                        <div className="flex items-center space-x-3">
                                            {mvt.typeMouvement === 'encaissement' ? (
                                                <PlusCircle className="text-green-500 flex-shrink-0" size={20} />
                                            ) : (
                                                <MinusCircle className="text-red-500 flex-shrink-0" size={20} />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 capitalize">
                                                    {mvt.description || (mvt.typeMouvement === 'encaissement' ? 'Encaissement' : 'Décaissement')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {/* Affichage amélioré de l'heure */}
                                                    {new Date(mvt.date).toLocaleDateString()} à {new Date(mvt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {mvt.tier && mvt.tierModel && ` | Tier (${mvt.tierModel}): ${getTierName(mvt.tier)}`}
                                                    {mvt.natureCharge && ` | Nature: ${mvt.natureCharge.libelle}`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`text-lg font-bold ${mvt.typeMouvement === 'encaissement' ? 'text-green-600' : 'text-red-600'}`}>
                                            {mvt.montant.toFixed(2)} DT
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};


// Composant utilitaire pour les boutons d'action (inchangé)
const ActionButton = ({ icon: Icon, label, color, link, disabled }) => {
    const baseClasses = "flex flex-col items-center p-4 rounded-xl shadow-sm transition-all duration-200 text-center border-2";
    let colorClasses = '';

    switch(color) {
        case 'green':
            colorClasses = 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed';
            break;
        case 'red':
            colorClasses = 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed';
            break;
        case 'blue':
            colorClasses = 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed';
            break;
        case 'orange':
        default:
            colorClasses = 'bg-orange-100 border-orange-200 text-orange-700 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed';
            break;
    }

    const Content = (
        <div className={`${baseClasses} ${colorClasses}`}>
            <Icon size={32} className="mb-2" />
            <span className="font-semibold text-sm">{label}</span>
        </div>
    );

    return disabled ? (
        Content
    ) : (
        <a href={link} className={`${baseClasses} ${colorClasses}`}>
            <Icon size={32} className="mb-2" />
            <span className="font-semibold text-sm">{label}</span>
        </a>
    );
};

export default Home;