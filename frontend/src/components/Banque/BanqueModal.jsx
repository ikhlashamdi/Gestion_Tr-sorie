import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";


const generateNextCode = (banques) => {
  if (!banques || banques.length === 0) return "BK01";

  const codes = banques
    .map((b) => b.code)
    .filter((code) => /^BK\d+$/.test(code));

  if (codes.length === 0) return "BK01";

  const maxNumber = Math.max(
    ...codes.map((code) => parseInt(code.replace("BK", ""), 10))
  );

  const nextNumber = (maxNumber + 1).toString().padStart(2, "0");
  return `BK${nextNumber}`;
};

export default function BanqueModal({ open, onClose, onSubmit, banque, banques }) {
  const [form, setForm] = useState({ code: "", libelle: "" });
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!banque) {
      const nextCode = generateNextCode(banques);
      setForm({ code: nextCode, libelle: "" });
    } else {
      setForm(banque);
    }
  }, [banque, open, banques]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "code" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isDuplicate = (banques || []).some(
      (b) => b.code === form.code && b._id !== banque?._id
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
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50" onMouseDown={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="bg-white p-6 rounded shadow-lg max-w-md w-full relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {banque ? "Modifier Banque" : "Ajouter Banque"}
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
              placeholder="Libellé"
              value={form.libelle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
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
              {banque ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
