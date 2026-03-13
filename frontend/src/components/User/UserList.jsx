import React, { useEffect, useState } from 'react';
import api from '../../api';
import { handleError, handleSuccess } from '../../utils/toastUtils';
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  Key, 
  Loader, 
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';
import AssignSocietesModal from './AssignSocietesModal.jsx';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  // NOUVEAU: État et fonctions pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);

  // Charger les utilisateurs et les statistiques
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch users
      const { data: usersData } = await api.get('/users');
      setUsers(usersData);

      // Fetch stats
      const { data: statsData } = await api.get('/users/stats');
      setStats({
        totalUsers: statsData.totalUsers,
        activeUsers: statsData.activeUsers,
        adminCount: statsData.adminCount
      });
      
      setRefreshing(false);
      setLoading(false);
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    // Remplacer window.confirm par un modal personnalisé pour un meilleur UX
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;

    try {
      const { data } = await api.delete(`/users/${id}`);
      handleSuccess(data.message);
      fetchData(); // Refresh the list and stats
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    }
  };

  // Réinitialiser un mot de passe
  const handleResetPassword = async (userId) => {
    // Remplacer window.confirm par un modal personnalisé
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
      try {
        await api.put(`/users/${userId}/reset-password`);
        handleSuccess("Mot de passe réinitialisé avec succès !");
      } catch (error) {
        handleError(error.response?.data?.message || error.message);
      }
    }
  };

  // NOUVEAU: Fonctions pour ouvrir/fermer le modal
  const handleOpenModal = (user) => {
      setUserToAssign(user);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setUserToAssign(null);
      // Optionnel: Re-fetch les données si l'affectation a été un succès
      fetchData();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredUsers = () => {
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortableItems = [...filteredUsers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const filteredAndSortedUsers = getSortedAndFilteredUsers();

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
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-2">
            Consultez et gérez tous les utilisateurs du système.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <Link
            to="/users/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Nouvel utilisateur</span>
          </Link>
        </div>
      </div>

      {/* Zone de recherche */}
      <div className="mb-6">
        <div className="flex items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, rôle..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nom
                  {sortConfig.key === "name" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortConfig.key === "email" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center">
                  Rôle
                  {sortConfig.key === "role" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Société
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Users size={40} className="mb-3" />
                    <p className="font-medium">Aucun utilisateur trouvé</p>
                    <p className="text-sm mt-1">
                      Essayez de modifier votre recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map(user => (
                <tr key={user._id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
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

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/users/edit/${user._id}`}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Réinitialiser le mot de passe"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                        title="Affecter à une société"
                      >
                        <Briefcase size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {filteredAndSortedUsers.length} utilisateurs affichés
        </div>
      </div>

      <ToastContainer position="bottom-right" />
      
      {/* NOUVEAU: Rendre le modal */}
      {isModalOpen && (
        <AssignSocietesModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          user={userToAssign}
          onAssignSuccess={handleCloseModal}
        />
      )}
    </div>
  );
}
