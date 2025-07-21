import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

// Fonction pour générer automatiquement le prochain code véhicule
const generateNextCode = (vehicules) => {
  if (!vehicules || vehicules.length === 0) return "VH01";

  const codes = vehicules
    .map((v) => v.code)
    .filter((code) => /^VH\d+$/.test(code));

  if (codes.length === 0) return "VH01";

  const maxNumber = Math.max(
    ...codes.map((code) => parseInt(code.replace("VH", ""), 10))
  );

  const nextNumber = (maxNumber + 1).toString().padStart(2, "0");
  return `VH${nextNumber}`;
};

export default function VehiculeModal({ open, onClose, onSubmit, vehicule, vehicules }) {
  const [form, setForm] = useState({ code: "", libelle: "" });
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!vehicule) {
      const nextCode = generateNextCode(vehicules);
      setForm({ code: nextCode, libelle: "" });
    } else {
      setForm(vehicule);
    }
  }, [vehicule, open, vehicules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "code" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isDuplicate = (vehicules || []).some(
      (v) => v.code === form.code && v._id !== vehicule?._id
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
      className="absolute inset-0 bg-black/30 flex items-center justify-center z-50"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {vehicule ? "Modifier Véhicule" : "Ajouter Véhicule"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Libellé</label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>
                    <div className="mb-6">
            <label className="block text-gray-700 mb-1">Matricule</label>
            <input
              type="text"
              name="numv"
              value={form.numv}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
              {vehicule ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
