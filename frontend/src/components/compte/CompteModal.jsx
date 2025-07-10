import { X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

export default function CompteModal({ open, onClose, onSubmit, compte }) {
  const [form, setForm] = useState({ num_cpte: "", libelle: "", num_cpte_com: "" });
  const dialogRef = useRef(null);

  useEffect(() => {
    setForm(compte || { num_cpte: "", libelle: "", num_cpte_com: "" });
  }, [compte, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Close on click outside
  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-[var(--danger)] transition-colors"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {compte ? "Modifier Compte" : "Ajouter Compte"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Numéro de Compte</label>
            <input
              type="text"
              name="num_cpte"
              value={form.num_cpte}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Libellé</label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Numéro Compte Commercial</label>
            <input
              type="text"
              name="num_cpte_com"
              value={form.num_cpte_com}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[var(--error)] text-white hover:bg-red-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[var(--success)] text-white hover:bg-green-700"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}