import React, { useState, useEffect } from "react";
import axios from "axios";

export default function JournalCaisse() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCaisseCode, setSelectedCaisseCode] = useState("");
  const [caisses, setCaisses] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/caisses")
      .then((res) => setCaisses(res.data))
      .catch((err) => {
        console.error("Erreur chargement caisses :", err);
        alert("Impossible de charger les caisses");
      });
  }, []);

  const fetchJournal = async () => {
    if (!startDate || !endDate) {
      alert("Veuillez sélectionner une date de début et de fin.");
      return;
    }

    setLoading(true);
    try {
      const params = {
        start: startDate,
        end: endDate,
      };
      if (selectedCaisseCode) {
        params.caisse = selectedCaisseCode; // Ici on filtre par code
      }

      const res = await axios.get("http://localhost:5000/api/mouvements", {
        params,
      });

      setMouvements(res.data);
    } catch (err) {
      console.error("Erreur chargement journal :", err);
      alert("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Journal de Caisse</h1>

      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block mb-1 font-medium">Du</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Au</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Caisse</label>
          <select
            value={selectedCaisseCode}
            onChange={(e) => setSelectedCaisseCode(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Toutes</option>
            {caisses.map((caisse) => (
              <option key={caisse._id} value={caisse.code}>
                {caisse.libelle}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchJournal}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Chargement..." : "Rechercher"}
        </button>
      </div>

      {mouvements.length === 0 ? (
        <p className="text-gray-500">Aucun mouvement trouvé pour cette période.</p>
      ) : (
       <table className="min-w-full border border-gray-300 rounded shadow overflow-hidden">
  <thead className="bg-blue-600 text-white">
    <tr>
      <th className="px-4 py-2 text-left">Date</th>
      <th className="px-4 py-2 text-left">Nature Charge</th>
      <th className="px-4 py-2 text-left">Type Mouvement</th>
      <th className="px-4 py-2 text-left">Tier Type</th>
      <th className="px-4 py-2 text-left">Raison Sociale</th>
      <th className="px-4 py-2 text-right">Montant</th>
    </tr>
  </thead>
<tbody> 
    {mouvements.map((mvt) => ( 
 <tr key={mvt._id} className="border-t border-gray-200 hover:bg-blue-50"> 
        <td className="px-4 py-2">{new Date(mvt.date).toLocaleDateString()}</td> 
        <td className="px-4 py-2">{mvt.natureCharge?.libelle || "-"}</td>
         <td className="px-4 py-2">{mvt.typeMouvement || mvt.type || "-"}</td> 
         <td className="px-4 py-2">{mvt.tierType || "-"}</td>
         <td className="px-4 py-2"> {mvt.tier?.rsoc || mvt.tier?.libelle || "-"} </td> 
         <td className="px-4 py-2 text-right">{mvt.montant?.toFixed(3)} DT</td> 
 </tr> ))} 
</tbody>
</table>

      )}
    </div>
  );
}
