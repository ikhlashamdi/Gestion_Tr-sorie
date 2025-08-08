import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

// Génère automatiquement le prochain code TIxx
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

export default function TierModal({ isOpen, onClose, model, onCreated }) {
  const [form, setForm] = useState({ libelle: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/autre?model=${model}`);
        setTiers(res.data);
        const nextCode = generateNextCode(res.data);
        setForm((prev) => ({ ...prev, code: nextCode }));
      } catch (err) {
        console.error("Erreur lors du chargement des tiers :", err);
      }
    };

    if (isOpen && model) {
      fetchTiers();
    }
  }, [isOpen, model]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "code" ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.libelle || !form.code) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`http://localhost:5000/api/autre`, {
        ...form,
        model,
      });

      onCreated(model, res.data); // met à jour dans le parent
      setForm({ libelle: "", code: "" });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du tiers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Nouveau {model}</h2>

        {error && <div className="mb-3 text-red-600 bg-red-100 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
