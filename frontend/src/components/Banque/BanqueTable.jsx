import { Pencil, Trash2, Plus, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BanqueTable({
  banques = [],
  onEdit = () => {},
  onDelete = () => {},
  onAdd = () => {},
  onSearch = () => {},
  showHeader = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    const sortableItems = [...banques];
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

  const filteredBanques = getSortedItems();

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      {showHeader && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Banques</h2>
              <p className="text-gray-600">Liste des comptes bancaires enregistrés</p>
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
                <span>Nouvelle Banque</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type de compte</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Tous les types</option>
                    <option value="courant">Compte courant</option>
                    <option value="epargne">Compte épargne</option>
                    <option value="entreprise">Compte entreprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Devise</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Toutes les devises</option>
                    <option value="TND">TND (Dinar tunisien)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar américain)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
              <Search size={20} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Rechercher par code, libellé ou numéro de compte..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
        </>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center justify-center">
                  Code Banque
                  {sortConfig.key === "code" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("libelle")}
              >
                <div className="flex items-center justify-center">
                  Libellé
                  {sortConfig.key === "libelle" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("numcompte")}
              >
                <div className="flex items-center justify-center">
                  Numéro de Compte
                  {sortConfig.key === "numcompte" && (
                    sortConfig.direction === "ascending" ? 
                    <ChevronUp size={14} className="ml-1" /> : 
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBanques.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Aucune banque trouvée</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBanques.map((banque) => (
                <tr key={banque._id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
                    {banque.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {banque.libelle}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {banque.numcompte}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(banque)} 
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(banque._id)} 
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
          {filteredBanques.length} banque(s) affichée(s)
        </div>
      </div>
    </div>
  );
}