import React, { useEffect, useState } from "react";
import api from "../../api";
import { handleError, handleSuccess } from "../../utils/toastUtils";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import {
  Building2,
  Loader,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function SocieteList() {
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Charger les sociétés
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get("/companies");
      setSocietes(data);
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

  // Supprimer une société
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette société ?"))
      return;

    try {
      const { data } = await api.delete(`/companies/${id}`);
      handleSuccess(data.message || "Société supprimée avec succès");
      fetchData();
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredSocietes = () => {
    const filtered = societes.filter((societe) =>
      societe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  };

  const filteredAndSortedSocietes = getSortedAndFilteredSocietes();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion des Sociétés
          </h1>
          <p className="text-gray-600 mt-2">
            Consultez et gérez toutes les sociétés.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <Link
            to="/societes/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Nouvelle société</span>
          </Link>
          
        </div>
      </div>

      {/* Zone de recherche */}
      <div className="mb-6">
        <div className="flex items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par nom de société..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Tableau des sociétés */}
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
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp size={14} className="ml-1" />
                    ) : (
                      <ChevronDown size={14} className="ml-1" />
                    ))}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedSocietes.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Building2 size={40} className="mb-3" />
                    <p className="font-medium">Aucune société trouvée</p>
                    <p className="text-sm mt-1">
                      Essayez de modifier votre recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedSocietes.map((societe) => (
                <tr
                  key={societe._id}
                  className="hover:bg-purple-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {societe.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {societe.address || "Non renseignée"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(societe.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/societes/edit/${societe._id}`}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(societe._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
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
          {filteredAndSortedSocietes.length} sociétés affichées
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
