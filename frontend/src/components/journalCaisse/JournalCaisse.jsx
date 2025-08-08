import React, { useState, useEffect } from "react";
import axios from "axios";

export default function JournalCaisse() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCaisseCode, setSelectedCaisseCode] = useState("");
  const [caisses, setCaisses] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/caisses");
        setCaisses(res.data);
      } catch (err) {
        console.error("Erreur chargement caisses :", err);
        setError("Impossible de charger les caisses");
      }
    };
    fetchCaisses();
  }, []);

  const fetchJournal = async () => {
    if (!startDate || !endDate) {
      setError("Veuillez sélectionner une date de début et de fin.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = { start: startDate, end: endDate };
      if (selectedCaisseCode) {
        params.caisse = selectedCaisseCode;
      }

      const res = await axios.get("http://localhost:5000/api/mouvements", { params });
      setMouvements(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur chargement journal :", err);
      setError("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeNow = () => {
    const now = new Date();
    return `Édité le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR")}`;
  };

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal de Caisse</h2>
          <p className="text-gray-600">Consultez les mouvements de caisse par période</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 items-center print:hidden">
          {mouvements.length > 0 && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Imprimer</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && mouvements.length > 0 && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Données chargées avec succès
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date début *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date fin *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Caisse</label>
          <select
            value={selectedCaisseCode}
            onChange={(e) => setSelectedCaisseCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Toutes les caisses</option>
            {caisses.map((caisse) => (
              <option key={caisse._id} value={caisse._id}>
                {caisse.libelle}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchJournal}
            disabled={loading}
            className={`w-full flex justify-center items-center gap-1 px-3 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg transition-colors shadow-md ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-indigo-800'
            }`}
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin h-4 w-4 mr-1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span>Rechercher</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div id="printable-journal">
        <div className="hidden print:block text-right font-medium text-sm mb-1">
          {formatDateTimeNow()}
        </div>

        <div className="hidden print:block text-center font-bold text-lg mt-6 mb-2">
          EXTRAIT CAISSE
        </div>
        <div className="hidden print:block font-semibold text-center text-sm mb-4">
          DU {new Date(startDate).toLocaleDateString("fr-FR")} AU{" "}
          {new Date(endDate).toLocaleDateString("fr-FR")}
        </div>

        {mouvements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            Aucun mouvement trouvé pour cette période
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Nature Charge</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Tier Type</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Raison Sociale</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">Montant (DT)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mouvements.map((mvt) => {
                  return (
                    <tr key={mvt._id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(mvt.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        {mvt.natureCharge?.libelle || "-"}
                      </td>
                      <td className={`px-4 py-3 font-medium `}>
                        {mvt.typeMouvement === 'encaissement' ? 'Encaissement' : 'Décaissement'}
                      </td>
                      <td className="px-4 py-3">
                        {mvt.tierModel || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {mvt.tier?.rsoc || mvt.tier?.libelle || "-"}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium`}>
                        {mvt.montant?.toFixed(3)} DT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}