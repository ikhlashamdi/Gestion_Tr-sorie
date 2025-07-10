import { Pencil, Trash2 } from "lucide-react";
import React from "react";

export default function JournalTable({ journals, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white rounded-xl shadow-lg border-gray-200">
        <thead>
          <tr className="bg-[var(--primary-light)] text-white">
            <th className="py-3 px-4 font-semibold text-left rounded-tl-xl">
              Numéro
            </th>
            <th className="py-3 px-4 font-semibold text-left">Libellé</th>
            <th className="py-3 px-4 font-semibold text-center rounded-tr-xl">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {journals.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-400">
                Aucun journal trouvé.
              </td>
            </tr>
          ) : (
            journals.map((journal, idx) => (
              <tr
                key={journal._id}
                className={`transition-colors ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-[var(--primary-light)/10]`}
              >
                <td className="py-3 px-4">{journal.numero}</td>
                <td className="py-3 px-4">{journal.libelle}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onEdit(journal)}
                    className="inline-flex items-center justify-center p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                    title="Modifier"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => onDelete(journal._id)}
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
  );
}