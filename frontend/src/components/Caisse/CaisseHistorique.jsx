import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CaisseHistorique({ caisseId }) {
const [historique, setHistorique] = useState([]);
const [soldeInitial, setSoldeInitial] = useState(0);
const [soldeFinal, setSoldeFinal] = useState(0);
const [caisseInfo, setCaisseInfo] = useState({});
const [loading, setLoading] = useState(true);
const [erreur, setErreur] = useState("");

useEffect(() => {
const fetchHistorique = async () => {
try {
setLoading(true);
const res = await axios.get("http://localhost:5000/api/mouvements/historique/${caisseId}");
setHistorique(res.data.historique);
setSoldeInitial(res.data.soldeInitial);
setSoldeFinal(res.data.soldeFinal);
setCaisseInfo(res.data.caisse);
} catch (err) {
console.error(err);
setErreur("❌ Erreur lors du chargement de l’historique.");
} finally {
setLoading(false);
}
};


if (caisseId) fetchHistorique();
}, [caisseId]);

if (loading) return <div className="p-4">Chargement...</div>;
if (erreur) return <div className="p-4 text-red-600">{erreur}</div>;

return (
<div className="p-6">
<h2 className="text-2xl font-bold mb-2">📘 Historique de la caisse</h2>
<p className="mb-4 text-gray-700">
<strong>Caisse :</strong> {caisseInfo?.libelle} ({caisseInfo?.code})<br />
<strong>Solde initial :</strong> {soldeInitial.toFixed(2)} DT<br />
<strong>Solde final :</strong> {soldeFinal.toFixed(2)} DT
</p>

  <table className="min-w-full text-sm border border-gray-300 rounded shadow-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-2 border">Date</th>
        <th className="p-2 border">Type</th>
        <th className="p-2 border">Montant</th>
        <th className="p-2 border">Tiers</th>
        <th className="p-2 border">Nature</th>
        <th className="p-2 border">Utilisateur</th>
        <th className="p-2 border">Description</th>
        <th className="p-2 border">Solde courant</th>
      </tr>
    </thead>
    <tbody>
      {historique.map((mvt) => (
        <tr key={mvt._id} className="hover:bg-gray-50">
          <td className="p-2 border">{new Date(mvt.date).toLocaleDateString()}</td>
          <td className="p-2 border capitalize">{mvt.type}</td>
          <td className="p-2 border text-right">{mvt.montant.toFixed(2)}</td>
          <td className="p-2 border">{mvt.tier || "-"}</td>
          <td className="p-2 border">{mvt.nature || "-"}</td>
          <td className="p-2 border">{mvt.utilisateur || "-"}</td>
          <td className="p-2 border">{mvt.description || "-"}</td>
          <td className="p-2 border text-right font-semibold">{mvt.soldeCourant.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
);
}