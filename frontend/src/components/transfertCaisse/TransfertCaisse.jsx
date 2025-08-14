import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TransfertCaisse() {
  const [caisses, setCaisses] = useState([]);
  const [caisseSource, setCaisseSource] = useState("");
  const [caisseDestination, setCaisseDestination] = useState("");
  const [montant, setMontant] = useState("");
  const [motif, setMotif] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "❌ Vous devez être connecté.", type: "error" });
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        setMessage({ text: "❌ Impossible de récupérer l'utilisateur connecté.", type: "error" });
      }
    };
    fetchCurrentUser();
  }, []);

  // Récupérer les caisses
  useEffect(() => {
    const fetchCaisses = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/caisses");
        setCaisses(res.data);
      } catch (err) {
        setMessage({ text: "❌ Impossible de récupérer les caisses.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchCaisses();
  }, []);

  // Envoi du transfert
  const handleTransfert = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      setMessage({ text: "❌ Utilisateur non trouvé.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (caisseSource === caisseDestination) {
      setMessage({ text: "❌ La caisse source et destination doivent être différentes.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/transferts", {
        caisseSource,
        caisseDestination,
        montant,
        motif,
        utilisateur: currentUser._id,
      });

      setMessage({
        text: "✅ Transfert effectué avec succès !",
        type: "success",
      });

      // Réinitialisation
      setCaisseSource("");
      setCaisseDestination("");
      setMontant("");
      setMotif("");

    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Erreur lors du transfert.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnuler = () => {
  setCaisseSource("");
  setCaisseDestination("");
  setMontant("");
  setMotif("");
  setMessage({ text: "", type: "" });
};

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Transfert entre Caisses</h2>
          <p className="text-gray-600">Effectuez des transferts entre vos différentes caisses</p>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-3 rounded-lg ${
            message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleTransfert} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Caisse Source */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caisse Source *
            </label>
            <select
              value={caisseSource}
              onChange={(e) => setCaisseSource(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="">Sélectionnez une caisse</option>
              {caisses.map((caisse) => (
                <option key={caisse._id} value={caisse._id}>
                  {caisse.libelle} - Solde: {caisse.soldeActuel?.toFixed(2) || 0.000} DT
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Montant (DT) *
            </label>
            <input
              type="number"
              placeholder="Montant à transférer"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              min="0.001"
              step="0.001"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          {/* Caisse Destination */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caisse Destination *
            </label>
            <select
              value={caisseDestination}
              onChange={(e) => setCaisseDestination(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="">Sélectionnez une caisse</option>
              {caisses.map((caisse) => (
                <option key={caisse._id} value={caisse._id} disabled={caisse._id === caisseSource}>
                  {caisse.libelle} - Solde: {caisse.soldeActuel?.toFixed(2) || 0.000} DT
                </option>
              ))}
            </select>
          </div>
          
          {/* Motif */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description du Transfert *
            </label>
            <textarea
              placeholder="Décrivez la raison du transfert"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end mt-4 space-x-4">
  <button
    type="button"
    onClick={handleAnnuler}
    className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-400 transition-colors"
  >
    Annuler
  </button>

  <button
    type="submit"
    disabled={isSubmitting || loading}
    className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium shadow-md hover:from-purple-700 hover:to-indigo-800 transition-colors ${
      isSubmitting || loading ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {isSubmitting ? (
      <div className="flex items-center">
        <svg
          className="animate-spin h-5 w-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Traitement en cours...
      </div>
    ) : (
      "Effectuer le transfert"
    )}
  </button>
</div>

      </form>
    </div>
  );
}
