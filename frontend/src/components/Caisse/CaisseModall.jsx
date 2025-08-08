import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function CaisseModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    libelle: "",
    code: "",
    soldeInitial: 0,
    seuilMax: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ utilisateur: "", societe: "" });
  const dialogRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non authentifié.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo({
          utilisateur: res.data._id,
          societe: res.data.societe,
        });
      } catch (err) {
        console.error("Erreur récupération user connecté", err);
        setError("Impossible de récupérer les informations de l'utilisateur.");
      }
    };

    if (isOpen) {
      fetchUserInfo();
      setForm({
        libelle: "",
        code: "",
        soldeInitial: 0,
        seuilMax: 0,
      });
      setError("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "soldeInitial" || name === "seuilMax" ? Number(value) : value,
    }));
  };

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.libelle.trim()) {
      setError("Le libellé est requis");
      setLoading(false);
      return;
    }

    if (form.seuilMax > 0 && form.soldeInitial > form.seuilMax) {
      setError("Le solde initial ne peut pas dépasser le seuil maximal");
      setLoading(false);
      return;
    }

    if (!userInfo.utilisateur || !userInfo.societe) {
      setError("Informations utilisateur manquantes. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...form,
      utilisateur: userInfo.utilisateur,
      societe: userInfo.societe,
    };

    onSubmit(dataToSend); // délègue la requête au composant parent
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

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
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Ajouter une nouvelle caisse
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Libellé *</label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nom de la caisse"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Solde initial</label>
            <input
              type="number"
              name="soldeInitial"
              value={form.soldeInitial}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Seuil max</label>
            <input
              type="number"
              name="seuilMax"
              value={form.seuilMax}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
