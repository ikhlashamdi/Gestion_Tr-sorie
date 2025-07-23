import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MvtCaisseForm() {
  const [caisse, setCaisse] = useState("");
  const [typeMouvement, setTypeMouvement] = useState("Decaissement");
  const [natureCharge, setNatureCharge] = useState(null);
  const [activeTierTab, setActiveTierTab] = useState("tiers");
  const [selectedTier, setSelectedTier] = useState(null);
  const [montantTotal, setMontantTotal] = useState(0);

  const [natureCharges, setNatureCharges] = useState([]);
  const [clients, setClients] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [banques, setBanques] = useState([]);
  const [caisses, setCaisses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [
          resNatureCharges,
          resClients,
          resFournisseurs,
          resTiers,
          resVehicules,
          resPersonnels,
          resBanques,
          resCaisses
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/nature-charges"),
          axios.get("http://localhost:5000/api/clients"),
          axios.get("http://localhost:5000/api/fournisseurs"),
          axios.get("http://localhost:5000/api/tiers"),
          axios.get("http://localhost:5000/api/vehicules"),
          axios.get("http://localhost:5000/api/personnels"),
          axios.get("http://localhost:5000/api/banques"),
          axios.get("http://localhost:5000/api/caisses")
        ]);
        setNatureCharges(resNatureCharges.data);
        setClients(resClients.data);
        setFournisseurs(resFournisseurs.data);
        setTiers(resTiers.data);
        setVehicules(resVehicules.data);
        setPersonnels(resPersonnels.data);
        setBanques(resBanques.data);
        setCaisses(resCaisses.data);
        if (resCaisses.data.length > 0) setCaisse(resCaisses.data[0].code || "");
        setLoading(false);
      } catch (e) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const getCurrentTierList = () => {
    switch (activeTierTab) {
      case "clients": return clients;
      case "fournisseurs": return fournisseurs;
      case "vehicule": return vehicules;
      case "personnel": return personnels;
      case "banque": return banques;
      default: return tiers;
    }
  };
  const getLibelle = (item) => {
  switch (activeTierTab) {
    case "fournisseurs":
    case "clients":
      return item.rsoc;
   
    case "banque":
    case "personnel":
    case "vehicule":
    case "tiers":
    default:
      return item.libelle;
  }
};


  const handleSubmit = async () => {
    if (!caisse || !natureCharge || !selectedTier) {
      setSubmitMsg("Veuillez sélectionner tous les champs obligatoires.");
      return;
    }
    try {
      setSubmitMsg("Envoi en cours...");
   const payload = {
  caisseCode: caisse,
  typeMouvement,
  natureCharge: natureCharge._id || natureCharge,
  natureChargeCode: natureCharge.code || "",
  tierType: activeTierTab,
  tierCode: selectedTier.code,
  montant: montantTotal
};

      await axios.post("http://localhost:5000/api/mouvements", payload);
      setSubmitMsg(" Mouvement enregistré avec succès !");
      setNatureCharge("");
      setSelectedTier(null);
      setMontantTotal(0);
    } catch (e) {
      setSubmitMsg(" Erreur : " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <div className="text-center text-lg py-8">⏳ Chargement des données...</div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 rounded-lg bg-white shadow max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-primary  pb-2">Enregistrement Mouvement de Caisse</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Caisse</label>
          <select
            value={caisse}
            onChange={(e) => setCaisse(e.target.value)}
            className="border rounded w-full px-3 py-2"
          >
            <option value="">-- Sélectionnez une caisse --</option>
            {caisses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Type de Mouvement</label>
          <select
            value={typeMouvement}
            onChange={(e) => setTypeMouvement(e.target.value)}
            className="border rounded w-full px-3 py-2"
          >
            <option value="Decaissement">Décaissement</option>
            <option value="Encaissement">Encaissement</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Nature de Charge</label>
          <select
            value={natureCharge?.code || ""}
            onChange={(e) =>
              setNatureCharge(natureCharges.find((n) => n.code === e.target.value) || "")
            }
            className="border rounded w-full px-3 py-2"
          >
            <option value="">-- Sélectionnez une nature de charge --</option>
            {natureCharges.map((n) => (
              <option key={n.code} value={n.code}>
                {n.code} - {n.libelle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-2">
        <label className="block font-medium">Type de Tiers</label>
        <div className="flex flex-wrap gap-2">
          {["tiers", "clients", "fournisseurs", "vehicule", "personnel", "banque"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTierTab(tab);
                setSelectedTier(null);
              }}
              className={`px-4 py-1.5 rounded-full border transition ${
                activeTierTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Liste tiers */}
      <div className="overflow-x-auto  rounded shadow-sm">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Libellé</th>
              <th className="py-2 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentTierList().map((item) => (
              <tr key={item.code} className={selectedTier?.code === item.code ? "bg-green-100" : ""}>
                <td className="px-4 py-2">{item.code}</td>
               <td className="px-4 py-2">{getLibelle(item)}</td>

                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setSelectedTier(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Choisir
                  </button>
                </td>
              </tr>
            ))}
            {getCurrentTierList().length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-4">
                  Aucun élément trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Montant */}
      <div>
        <label className="block font-medium mb-1">Montant</label>
        <input
          type="number"
          value={montantTotal}
          onChange={(e) => setMontantTotal(Number(e.target.value))}
          min={0}
          className="border rounded px-3 py-2 w-full"
          placeholder="Saisir un montant"
        />
      </div>

      {/* Résumé + Bouton */}
      <div className="flex items-center justify-between mt-4">
        <div className="font-bold text-lg">
          Total : {montantTotal.toLocaleString("fr-FR")} TND
        </div>
        <button
          onClick={handleSubmit}
          disabled={!caisse || !natureCharge || !selectedTier || montantTotal <= 0}
          className={`px-6 py-2 rounded text-white font-semibold transition ${
            !caisse || !natureCharge || !selectedTier || montantTotal <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-primary-dark"
          }`}
        >
          Valider
        </button>
      </div>

      {submitMsg && <div className="text-center text-sm text-gray-700 mt-4">{submitMsg}</div>}
    </div>
  );
}