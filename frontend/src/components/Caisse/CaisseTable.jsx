import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, Power, Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function CaisseTable({
  caisses = [],
  onEdit = () => {},
  onDelete = () => {},
  onAdd = () => {},
  onSearch = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    minAmount: "",
    maxAmount: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Erreur récupération utilisateur");

        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/caisses/${id}/activer`, { method: "PATCH" });
      if (!res.ok) throw new Error("Échec du changement de statut");
      onSearch("");
    } catch (err) {
      console.error("Erreur activation/désactivation :", err);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    const sortableItems = [...caisses];
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

  const handleFilterChange = (filterName, value) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: value
    });
  };

  const applyFilters = (caisse) => {
    // Status filter
    if (activeFilters.status && activeFilters.status !== "all") {
      if (activeFilters.status === "active" && !caisse.active) return false;
      if (activeFilters.status === "inactive" && caisse.active) return false;
    }
    
    // Amount filters
    if (activeFilters.minAmount && caisse.soldeActuel < parseFloat(activeFilters.minAmount)) {
      return false;
    }
    if (activeFilters.maxAmount && caisse.soldeActuel > parseFloat(activeFilters.maxAmount)) {
      return false;
    }
    
    return true;
  };

  const filteredCaisses = getSortedItems().filter(applyFilters);

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Caisse</h2>
    
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            <span>Filtres</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Nouvelle caisse</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
              <select
                value={activeFilters.status || "all"}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Solde min </label>
              <input
                type="number"
                placeholder="Min"
                value={activeFilters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Solde max </label>
              <input
                type="number"
                placeholder="Max"
                value={activeFilters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par libellé, code, utilisateur..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none text-gray-700"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider cursor-pointer"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center">
                  Code
                  {sortConfig.key === "code" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider cursor-pointer"
                onClick={() => handleSort("libelle")}
              >
                <div className="flex items-center">
                  Libellé
                  {sortConfig.key === "libelle" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Solde Initial 
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Seuil Max 
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider cursor-pointer"
                onClick={() => handleSort("soldeActuel")}
              >
                <div className="flex items-center">
                  Solde Actuel 
                  {sortConfig.key === "soldeActuel" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Société
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Responsable
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800  tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCaisses.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Aucune caisse trouvée</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCaisses.map((caisse) => (
                <tr key={caisse._id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{caisse.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caisse.libelle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caisse.soldeInitial?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caisse.seuilMax?.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    caisse.soldeActuel > caisse.seuilMax ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {caisse.soldeActuel?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caisse.utilisateur?.societe}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caisse.utilisateur?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(caisse.dateCreation).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        caisse.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {caisse.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(caisse)} 
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(caisse._id)} 
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(caisse._id)} 
                        className={`p-2 rounded-full transition-colors ${
                          caisse.active 
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                            : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                        }`}
                        title={caisse.active ? "Désactiver" : "Activer"}
                      >
                        <Power size={16} />
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
          {filteredCaisses.length} caisses affichées
        </div>
      </div>
    </div>
  );
}