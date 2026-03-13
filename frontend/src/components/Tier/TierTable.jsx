import React, { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function TierTable({ 
  tiers = [], 
  onEdit = () => {}, 
  onDelete = () => {}, 
  onAdd = () => {}, 
  onSearch = () => {} 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  
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
    const sortableItems = [...tiers];
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

  const filteredTiers = getSortedItems();

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Tiers</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
        
          
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Nouveau Tier</span>
          </button>
        </div>
      </div>

     

      <div className="mb-6">
        <div className="flex items-center bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par code, libellé..."
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
                className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center justify-center">
                  Code
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

              <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTiers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Aucun tier trouvé</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTiers.map((tier) => (
                <tr key={tier._id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
                    {tier.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {tier.libelle}
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(tier)} 
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(tier._id)} 
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
          {filteredTiers.length} tiers affichés
        </div>
      </div>
    </div>
  );
}