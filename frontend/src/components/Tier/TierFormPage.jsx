import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function TierFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ code: "", libelle: "" });
  const [error, setError] = useState("");
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/autre").then((res) => {
      setTiers(res.data);

      if (!id) {
        const codes = res.data
          .map((t) => t.code)
          .filter((code) => /^TI\d+$/.test(code));

        const max = Math.max(
          ...codes.map((c) => parseInt(c.replace("TI", ""), 10)),
          0
        );
        const nextCode = `TI${String(max + 1).padStart(2, "0")}`;
        setForm((prev) => ({ ...prev, code: nextCode }));
      }
    });

    if (id) {
      axios
        .get(`http://localhost:5000/api/autre/${id}`)
        .then((res) => setForm({ 
          code: res.data.code, 
          libelle: res.data.libelle 
        }))
        .catch((err) => {
          console.error("Erreur récupération tier :", err);
          navigate("/tier");
        });
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === "code" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isDuplicate = tiers.some(
      (t) => t.code === form.code && t._id !== id
    );
    if (isDuplicate) {
      setError("❌ Ce code existe déjà.");
      return;
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/autre/${id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/autre", form);
      }
      navigate("/tier");
    } catch (err) {
      const msg = err?.response?.data?.error || "❌ Erreur lors de l'enregistrement.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id ? "Modifier un Tier" : "Nouveau Tier"}
            </h1>
            <p className="text-gray-500 mt-1">
              {id
                ? "Modifier les informations du tier"
                : "Ajouter un nouveau tier"}
            </p>
          </div>
          <button
            onClick={() => navigate("/tier")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Retour</span>
          </button>
        </div>
        <div className="border-b border-gray-200 mt-4"></div>
      </div>

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Libellé</label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Entrez le libellé"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/tier")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              {id ? "ENREGISTRER LES MODIFICATIONS" : "AJOUTER LE TIER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}