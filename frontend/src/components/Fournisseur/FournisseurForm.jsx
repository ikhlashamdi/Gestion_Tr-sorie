import React, { useState, useEffect } from "react";
import { UserCheck, UserPlus } from "lucide-react";

export default function FournisseurForm({ onSubmit, fournisseur, onCancel, isEdit = false }) {
  const [form, setForm] = useState({
    code: "",
    rsoc: "",
    adresse: "",
    mf: "",
    tel: "",
    email: "",
  });

  useEffect(() => {
    if (fournisseur) {
      setForm(fournisseur);
    }
  }, [fournisseur]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="w-full mt-10 px-6">
      {/* En-tête */}
      <div className="bg-white px-6 py-4 rounded-lg shadow flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Modifier Fournisseur" : "Ajouter un fournisseur"}
        </h1>
        <div className="text-sm text-gray-500">
          <button
            onClick={onCancel}
            className="bg-gray-100 px-3 py-1 rounded text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition"
          >
            Retour
          </button>
          <span className="mx-1">/</span>
          <span className="text-gray-500">{isEdit ? "Modification" : "Création"}</span>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly={isEdit}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                isEdit ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
            <input
              type="text"
              name="rsoc"
              value={form.rsoc}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
            <input
              type="text"
              name="mf"
              value={form.mf}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matricule Fiscale (MF)</label>
            <input
              type="text"
              name="mf"
              value={form.mf}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              name="tel"
              value={form.tel}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary-light)]"
            >
              {isEdit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
