import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

// Fonction pour générer automatiquement le prochain code
const generateNextCode = (tiers) => {
  if (!tiers || tiers.length === 0) return "TI01";

  const codes = tiers
    .map((t) => t.code)
    .filter((code) => /^TI\d+$/.test(code));

  if (codes.length === 0) return "TI01";

  const maxNumber = Math.max(
    ...codes.map((code) => parseInt(code.replace("TI", ""), 10))
  );

  const nextNumber = (maxNumber + 1).toString().padStart(2, "0");
  return `TI${nextNumber}`;
};

export default function TierModal({ open, onClose, onSubmit, tier, tiers }) {
  const [form, setForm] = useState({ code: "", libelle: "" });
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!tier) {
      const nextCode = generateNextCode(tiers);
      setForm({ code: nextCode, libelle: "" });
    } else {
      setForm(tier);
    }
  }, [tier, open, tiers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "code" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isDuplicate = (tiers || []).some(
      (t) => t.code === form.code && t._id !== tier?._id
    );
    if (isDuplicate) {
      alert("Ce code existe déjà !");
      return;
    }

    onSubmit(form);
  };

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/30"
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {tier ? "Modifier Tier" : "Ajouter Tier"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly // rend le champ non modifiable
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary-light)] transition"
            >
              {tier ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
