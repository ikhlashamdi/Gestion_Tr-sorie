import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

// Génère automatiquement le prochain code BKxx
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

export default function BanqueModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    code: "",
    libelle: "",
    numcompte: "",
  });
  const [loading, setLoading] = useState(false);
  const [banques, setBanques] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchBanques = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/banques");
        setBanques(res.data);
        const nextCode = generateNextCode(res.data);
        setForm({
          code: nextCode,
          libelle: "",
          numcompte: "",
        });
      } catch (err) {
        console.error("Erreur chargement banques :", err);
      }
    };

    fetchBanques();
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "code" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.libelle) {
      setError("Code et Libellé sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:5000/api/banques", form);
      onCreated("Banque", res.data); 
      onClose(); 
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de la banque.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Nouvelle Banque</h2>

        {error && (
          <div className="mb-3 text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Libellé</label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro de compte</label>
            <input
              type="text"
              name="numcompte"
              value={form.numcompte}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
