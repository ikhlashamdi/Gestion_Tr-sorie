import React, { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientTable({
  clients = [],
  onEdit = () => {},
  onDelete = () => {},
  onAdd = () => {},
  onSearch = () => {},
  showHeader = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="w-full mt-10 px-6">
      {/* En-tête */}
      {showHeader && (
        <div className="bg-white px-6 py-4 rounded-lg shadow flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Gestion des Clients</h1>
          <div className="text-sm text-gray-500">
            <button
              onClick={() => navigate("/home")}
              className="bg-gray-100 px-3 py-1 rounded text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition"
            >
              Tableau de bord
            </button>
            <span className="mx-1">/</span>
            <span className="text-gray-500">Clients</span>
          </div>
        </div>
      )}

      {/* Filtres + Ajout */}
      {showHeader && (
         <div className="flex justify-between items-center px-4 mt-2">
          <h3 className="text-lg font-semibold text-gray-600">Recherche et filtres</h3>
          <button
            onClick={onAdd}
            className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary-light)] transition"
          >
            <Plus size={16} className="inline mr-1" />
            Nouveau Client
          </button>
        </div>
      )}

      {/* Barre de recherche */}
      {showHeader && (
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-b-md shadow mt-2">
          <Search className="text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par code, client ou matricule..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      )}

      {/* Nombre de résultats */}
      {showHeader && (
        <div className="mt-4 text-gray-600 font-semibold px-4">
          Liste des Clients ({clients.length})
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <thead>
            <tr className="bg-[var(--primary-light)] text-white">
              <th className="py-3 px-4 text-left">Code</th>
              <th className="py-3 px-4 text-left">Client</th>
              <th className="py-3 px-4 text-left">Matricule</th>
              <th className="py-3 px-4 text-left">Contact</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  Aucun client trouvé.
                </td>
              </tr>
            ) : (
              clients.map((client, idx) => (
                <tr
                  key={client._id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-[var(--primary-light)/10]`}
                >
                  <td className="py-3 px-4">{client.code}</td>
                  <td className="py-3 px-4">{client.rsoc}</td>
                  <td className="py-3 px-4">{client.mf}</td>
                  <td className="py-3 px-4">{client.tel}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onEdit(client)}
                      className="inline-flex items-center justify-center p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                      title="Modifier"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => onDelete(client._id)}
                      className="inline-flex items-center justify-center p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition ml-2"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
