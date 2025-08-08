import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save, Edit } from "lucide-react";

import TierModal from "./Tier/TierModall"; 
import ClientModal from "./Client/ClientModal";
import FournisseurModal from "./Fournisseur/FournisseurModal";
import BanqueModal from "./Banque/BanqueModal";
import VehiculeModal from "./Vehicule/VehiculeModal";
import CaisseModall from "./Caisse/CaisseModall";
import PersonnelModal from "./Personnel/PersonnelModal";
import NatureChargeModal from "./NatureDeCharge/NatureChargeModal";

export default function CaisseMouvementFormTable() {
  const [form, setForm] = useState({ caisse: "", utilisateur: "" });
  const [caisses, setCaisses] = useState([]);
  const [natures, setNatures] = useState([]);
  const [tiersByModel, setTiersByModel] = useState({});
  const [soldeInitialCaisse, setSoldeInitialCaisse] = useState(0);
  const [soldeActuelCaisse, setSoldeActuelCaisse] = useState(0);
  const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
  const [currentMouvementIndex, setCurrentMouvementIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedMouvements, setSavedMouvements] = useState([]);
  const [mouvements, setMouvements] = useState([
    {
      date: new Date().toISOString().split("T")[0],
      description: "",
      typeMouvement: "decaissement",
      montant: "",
      tierModel: "",
      tier: "",
      natureCharge: "",
    }
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [isCaisseModalOpen, setIsCaisseModalOpen] = useState(false);
  const [selectedModelForModal, setSelectedModelForModal] = useState("");
  
  // État pour contrôler le mode édition
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const caissesRes = await axios.get("http://localhost:5000/api/caisses");
        const caissesActives = caissesRes.data.filter(c => c.active);
        setCaisses(caissesActives);

        const naturesRes = await axios.get("http://localhost:5000/api/nature-charges");
        setNatures(naturesRes.data);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("❌ Aucun token trouvé.");

        const userRes = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);
        setForm((prev) => ({ ...prev, utilisateur: userRes.data._id }));
      } catch (err) {
        console.error(err);
        setError("❌ Erreur de chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCaisseChange = async (e) => {
    const selectedId = e.target.value;
    setForm((prev) => ({ ...prev, caisse: selectedId }));
    
    if (selectedId) {
      await loadCaisseSolde(selectedId);
    }
  };
  const loadRecentMouvements = async (caisseId) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/mouvements/historique/${caisseId}`);
    return res.data.historique || [];
  } catch (err) {
    console.error("Erreur chargement mouvements récents :", err);
    return [];
  }
};


  const fetchTiersForModel = async (model) => {
    if (!model || tiersByModel[model]) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/tiers?model=${model}`);
      setTiersByModel((prev) => ({ ...prev, [model]: res.data }));
    } catch (err) {
      console.error("Erreur chargement des tiers :", err);
      setTiersByModel((prev) => ({ ...prev, [model]: [] }));
    }
  };

  const handleLineChange = async (index, name, value) => {
    const updated = [...mouvements];
    updated[index][name] = value;
    if (name === "typeMouvement" && value === "encaissement") {
      updated[index].natureCharge = "";
    }
    if (name === "tierModel") {
      updated[index].tier = "";
      await fetchTiersForModel(value);
    }

    setMouvements(updated);
  };

  const addLine = () => {
    setMouvements((prev) => [
      ...prev,
      {
        date: new Date().toISOString().split("T")[0],
        description: "",
        typeMouvement: "decaissement",
        montant: "",
        tierModel: "",
        tier: "",
        natureCharge: "",
      }
    ]);
  };

  const removeLine = (index) => {
    if (mouvements.length === 1) {
      setError("❌ Vous devez avoir au moins un mouvement.");
      return;
    }
    setMouvements((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (!form.caisse || !form.utilisateur) {
    setError("❌ Veuillez choisir une caisse et être connecté.");
    return;
  }

  try {
    setIsSubmitting(true);
    setError("");

    const mouvementsToSend = mouvements.map(mvt => ({
      date: mvt.date,
      description: mvt.description,
      typeMouvement: mvt.typeMouvement,
      montant: parseFloat(mvt.montant) || 0,
      natureCharge: mvt.natureCharge || null,
      tier: mvt.tier || null,
      tierModel: mvt.tierModel || null,
    }));

    await axios.post("http://localhost:5000/api/mouvements/batch", {
      mouvements: mouvementsToSend,
      utilisateur: form.utilisateur,
      caisse: form.caisse,
    });

    await loadCaisseSolde(form.caisse); // recharge le solde mis à jour

    // Réinitialise les mouvements après sauvegarde
    setMouvements([{
      date: new Date().toISOString().split("T")[0],
      description: "",
      typeMouvement: "decaissement",
      montant: "",
      tierModel: "",
      tier: "",
      natureCharge: "",
    }]);

    setSuccess(true);
    setIsSaved(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    console.error(err);
    setError("❌ Solde insuffisant pour ce décaissement.");
  } finally {
    setIsSubmitting(false);
  }
};

  const startNewOperation = () => {
    setIsEditing(true); // Activer l'édition
    setIsSaved(false);
    
    // Ajouter une nouvelle ligne vide
    setMouvements([
      ...savedMouvements,
      {
        date: new Date().toISOString().split("T")[0],
        description: "",
        typeMouvement: "decaissement",
        montant: "",
        tierModel: "",
        tier: "",
        natureCharge: "",
      }
    ]);
  };

  const loadCaisseSolde = async (caisseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/caisses/${caisseId}/solde`);
      setSoldeInitialCaisse(res.data.soldeInitial);
      setSoldeActuelCaisse(res.data.soldeCalcule);
    } catch (err) {
      console.error("❌ Erreur récupération solde dynamique :", err);
      setSoldeInitialCaisse(0);
      setSoldeActuelCaisse(0);
    }
  };

  const handleDownloadJournal = async (format) => {
    if (!form.caisse) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/rapports/journal-caisse`, {
        params: { caisseId: form.caisse, format },
        responseType: "blob",
      });

      const file = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `journal_caisse.${format === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erreur de téléchargement :", err);
      alert("❌ Échec de génération du journal");
    }
  };

  const totalMouvements = mouvements.reduce((acc, mvt) => {
    const montantNum = parseFloat(mvt.montant) || 0;
    return mvt.typeMouvement === "decaissement" ? acc - montantNum : acc + montantNum;
  }, 0);

  const soldeActuelCalcule = soldeActuelCaisse + totalMouvements;

  const openTierModal = (model) => {
    setSelectedModelForModal(model);
    setTierModalOpen(true);
  };

  const createBanque = async (newBanque) => {
    try {
      const res = await axios.post("http://localhost:5000/api/banques", newBanque);
      setTiersByModel((prev) => ({
        ...prev,
        Banque: [...(prev.Banque || []), res.data],
      }));
      setTierModalOpen(false);
    } catch (err) {
      alert("Erreur création banque : " + err.message);
    }
  };

  const createVehicule = async (newVehicule) => {
    try {
      const res = await axios.post("http://localhost:5000/api/vehicules", newVehicule);
      setTiersByModel((prev) => ({
        ...prev,
        Vehicule: [...(prev.Vehicule || []), res.data],
      }));
      setTierModalOpen(false);
    } catch (err) {
      alert("Erreur création véhicule : " + err.message);
    }
  };

  const createNature = async (newNature) => {
    try {
      const res = await axios.post("http://localhost:5000/api/nature-charges", newNature);
      setNatures(prev => [...prev, res.data]);
      const updated = [...mouvements];
      updated[currentMouvementIndex].natureCharge = res.data._id;
      setMouvements(updated);
      setIsNatureModalOpen(false);
    } catch (err) {
      console.error("Erreur création nature :", err);
      alert("Erreur lors de la création de la nature de charge.");
    }
  };

  const createCaisse = async (newCaisse) => {
    try {
      const payload = {
        ...newCaisse,
        societe: currentUser?.societe,
      };

      const res = await axios.post("http://localhost:5000/api/caisses", payload);
      setCaisses(prev => [...prev, res.data]);
      setForm(prev => ({
        ...prev,
        caisse: res.data._id,
      }));
      setIsCaisseModalOpen(false);
    } catch (err) {
      console.error("Erreur création caisse :", err);
      alert("Erreur lors de la création de la caisse.");
    }
  };

  const createPersonnel = async (newPersonnel) => {
    try {
      const res = await axios.post("http://localhost:5000/api/personnels", newPersonnel);
      setTiersByModel((prev) => ({
        ...prev,
        Personnel: [...(prev.Personnel || []), res.data],
      }));
      setTierModalOpen(false);
    } catch (err) {
      alert("Erreur création personnel : " + err.message);
    }
  };

  const createTier = async (newTier) => {
    try {
      const res = await axios.post("http://localhost:5000/api/tiers", newTier);
      setTiersByModel((prev) => ({
        ...prev,
        Tiers: [...(prev.Tiers || []), res.data],
      }));
      setTierModalOpen(false);
    } catch (err) {
      alert("Erreur création tiers : " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mouvements de Caisse</h2>
          <p className="text-gray-600">Ajouter des encaissements ou décaissements pour une caisse</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {form.caisse && (
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadJournal("pdf")}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleDownloadJournal("excel")}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Excel</span>
              </button>
            </div>
          )}

          {isSaved ? (
            <button
              onClick={startNewOperation}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md"
            >
              <Edit size={14} />
              <span>Modifier</span>
            </button>
          ) : (
            <button
              type="submit"
              form="mouvement-form"
              disabled={isSubmitting}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg transition-colors shadow-md ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-purple-700 hover:to-indigo-800'
              }`}
            >
              {isSubmitting ? (
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
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Enregistré avec succès
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Caisse *</label>
          <select
            value={form.caisse}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "__new") {
                setIsCaisseModalOpen(true);
                return;
              }
              handleCaisseChange(e);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Choisir une caisse --</option>
            {caisses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.libelle} ({c.code})
              </option>
            ))}
            <option value="__new">➕ Créer nouvelle...</option>
          </select>
        </div>

               {form.caisse && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Solde initial</p>
                <p className="font-semibold">{soldeInitialCaisse.toFixed(2)} DT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total mouvements</p>
                <p className={`font-semibold ${
                  totalMouvements >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {totalMouvements.toFixed(2)} DT
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde actuel</p>
                <p className="font-semibold text-purple-700">{soldeActuelCalcule.toFixed(2)} DT</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form id="mouvement-form" onSubmit={handleSubmit}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Communication</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Montant (DT)</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Nature</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Modèle</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Tiers</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mouvements.map((mvt, index) => {
                // Détermine la couleur en fonction du type de mouvement
                const textColor = mvt.typeMouvement === 'encaissement' 
                  ? 'text-green-700' 
                  : 'text-red-700';
                
                return (
                  <tr 
                    key={index} 
                    className={`hover:bg-purple-50 transition-colors ${!isEditing ? 'bg-gray-50' : ''} ${textColor}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="date"
                        value={mvt.date}
                        onChange={(e) => handleLineChange(index, "date", e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={!isEditing}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={mvt.description}
                        onChange={(e) => handleLineChange(index, "description", e.target.value)}
                        placeholder="Description"
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={!isEditing}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mvt.typeMouvement}
                        onChange={(e) => handleLineChange(index, "typeMouvement", e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={!isEditing}
                      >
                        <option value="encaissement">Encaissement</option>
                        <option value="decaissement">Décaissement</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={mvt.montant}
                        onChange={(e) => handleLineChange(index, "montant", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={!isEditing}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {mvt.typeMouvement === "decaissement" ? (
                        <select
                          value={mvt.natureCharge}
                          onChange={(e) => {
                            if (e.target.value === "__new") {
                              setCurrentMouvementIndex(index);
                              setIsNatureModalOpen(true);
                              return;
                            }
                            handleLineChange(index, "natureCharge", e.target.value);
                          }}
                          className={`w-full px-2 py-1 border rounded-md ${
                            !isEditing 
                              ? 'border-gray-200 bg-gray-100' 
                              : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                          }`}
                          disabled={!isEditing}
                        >
                          <option value="">-- Nature --</option>
                          {natures.map((n) => (
                            <option key={n._id} value={n._id}>
                              {n.libelle}
                            </option>
                          ))}
                          <option value="__new">➕ Nouvelle nature...</option>
                        </select>
                      ) : (
                        <div className="text-center">-</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mvt.tierModel}
                        onChange={(e) => handleLineChange(index, "tierModel", e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={!isEditing}
                      >
                        <option value="">-- Modèle --</option>
                        <option value="Client">Client</option>
                        <option value="Fournisseur">Fournisseur</option>
                        <option value="Vehicule">Véhicule</option>
                        <option value="Personnel">Personnel</option>
                        <option value="Banque">Banque</option>
                        <option value="Tiers">Autre</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mvt.tier}
                        onChange={(e) => {
                          if (e.target.value === "__new") {
                            const selectedModel = mouvements[index].tierModel;
                            if (!selectedModel) {
                              alert("Veuillez d'abord choisir un modèle de tiers.");
                              return;
                            }
                            openTierModal(selectedModel);
                            return;
                          }
                          handleLineChange(index, "tier", e.target.value);
                        }}
                        disabled={!mvt.tierModel || !isEditing}
                        className={`w-full px-2 py-1 border rounded-md ${
                          !isEditing 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                      >
                        <option value="">-- Tiers --</option>
                        {(tiersByModel[mvt.tierModel] || []).map((t, idx) => (
                          <option key={t._id ?? `tier-${idx}`} value={t._id}>
                            {t.libelle} {t.rsoc} ({t.code})
                          </option>
                        ))}
                        <option value="__new">➕ Créer nouvelle...</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOUTON AJOUTER UNE LIGNE - TOUJOURS VISIBLE EN MODE ÉDITION */}
        {isEditing && (
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
            <span>Ajouter une ligne</span>
          </button>
        )}
      </form>

      {isNatureModalOpen && (
        <NatureChargeModal
          open={isNatureModalOpen}
          onClose={() => setIsNatureModalOpen(false)}
          onSubmit={createNature}
          natureCharges={natures}
        />
      )}

      {isCaisseModalOpen && (
        <CaisseModall
          isOpen={isCaisseModalOpen}
          onClose={() => setIsCaisseModalOpen(false)}
          onSubmit={createCaisse}
          caisses={caisses}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Client" && (
        <ClientModal
          isOpen={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          model="Client"
          onCreated={(model, newTier) => {
            setTiersByModel((prev) => ({
              ...prev,
              [model]: [...(prev[model] || []), newTier],
            }));
          }}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Fournisseur" && (
        <FournisseurModal
          isOpen={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          model="Fournisseur"
          onCreated={(model, newTier) => {
            setTiersByModel((prev) => ({
              ...prev,
              [model]: [...(prev[model] || []), newTier],
            }));
          }}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Banque" && (
        <BanqueModal
          open={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          banques={tiersByModel["Banque"] || []}
          onCreated={createBanque}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Vehicule" && (
        <VehiculeModal
          open={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          model="Vehicule"
          vehicules={tiersByModel["Vehicule"] || []}
          onCreated={createVehicule}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Personnel" && (
        <PersonnelModal
          open={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          model="Personnel"
          personnels={tiersByModel["Personnel"] || []}
          onCreated={createPersonnel}
        />
      )}

      {tierModalOpen && selectedModelForModal === "Tiers" && (
        <TierModal
          open={tierModalOpen}
          onClose={() => setTierModalOpen(false)}
          model="Tiers"
          tiers={tiersByModel["Tiers"] || []}
          onCreated={createTier}
        />
      )}
    </div>
  );
}