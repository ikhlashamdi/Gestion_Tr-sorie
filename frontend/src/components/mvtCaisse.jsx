import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save } from "lucide-react";

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
  const [soldeCaisseAvantNouveauxMouvements, setSoldeCaisseAvantNouveauxMouvements] = useState(0);
  const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
  const [currentMouvementIndex, setCurrentMouvementIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // État pour stocker les mouvements déjà sauvegardés (lecture seule)
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
  
  // Fonction pour récupérer les caisses par société
  const fetchCaisses = async (companyId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const currentCompanyId = companyId || localStorage.getItem("selectedCompanyId");
      
      const params = currentCompanyId ? { companyId: currentCompanyId } : {};
      
      const caissesRes = await axios.get("http://localhost:5000/api/caisses", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      const caissesActives = caissesRes.data.filter(c => c.active);
      setCaisses(caissesActives);
    } catch (err) {
      console.error("Erreur récupération des caisses :", err);
      setError("❌ Erreur de chargement des caisses.");
    }
  };

  // Récupérer la société sélectionnée
  useEffect(() => {
    const companyId = localStorage.getItem("selectedCompanyId");
    setSelectedCompanyId(companyId);

    const handleCompanyChange = () => {
      const newCompanyId = localStorage.getItem("selectedCompanyId");
      setSelectedCompanyId(newCompanyId);
      // Recharger les caisses quand la société change
      fetchCaisses(newCompanyId);
      // Réinitialiser la sélection de caisse
      setForm(prev => ({ ...prev, caisse: "" }));
      setMouvements([
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
      setSavedMouvements([]);
    };

    window.addEventListener("companyChanged", handleCompanyChange);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
    };
  }, []);

  // Chargement des données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("❌ Aucun token trouvé. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        
        // Récupérer les caisses selon la société
        await fetchCaisses();
        
        const [naturesRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/nature-charges", { headers }),
          axios.get("http://localhost:5000/api/users/me", { headers }),
        ]);

        setNatures(naturesRes.data);
        setCurrentUser(userRes.data);
        
        // Logique corrigée pour autoriser uniquement les caissiers à éditer
        const isCaissier = userRes.data.role === 'caissier';
        setIsEditing(isCaissier);

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

  const loadRecentMouvements = async (caisseId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      const res = await axios.get(`http://localhost:5000/api/mouvements/historique/${caisseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.data.historique || !Array.isArray(res.data.historique)) {
        return [];
      }

      const formattedMouvements = res.data.historique.map(mvt => {
        const newMvt = { ...mvt };
        if (newMvt.date) {
          newMvt.date = newMvt.date.split('T')[0];
        }
        return newMvt;
      });
      
      return formattedMouvements;
    } catch (err) {
      console.error("Erreur chargement mouvements récents :", err);
      return [];
    }
  };

  const handleCaisseChange = async (e) => {
    const selectedId = e.target.value;
    setForm((prev) => ({ ...prev, caisse: selectedId }));
    
    setMouvements([
      {
        date: new Date().toISOString().split("T")[0],
        description: "",
        typeMouvement: "decaissement",
        montant: "",
        tierModel: "",
        tier: "",
        natureCharge: "",
      },
    ]);
    setError("");
    setSuccess(false);
    
    if (selectedId) {
      await loadCaisseSolde(selectedId);
      const recent = await loadRecentMouvements(selectedId);
      setSavedMouvements(recent);
      
      // Les non-caissiers ne voient que les mouvements sauvegardés
      if (!isEditing) {
        setMouvements(recent);
      } else {
        // Les caissiers voient les mouvements sauvegardés plus une nouvelle ligne
        setMouvements([
          ...recent,
          {
            date: new Date().toISOString().split("T")[0],
            description: "",
            typeMouvement: "decaissement",
            montant: "",
            tierModel: "",
            tier: "",
            natureCharge: "",
          },
        ]);
      }
    }
  };

  const fetchTiersForModel = async (model) => {
    const token = localStorage.getItem("token");
    if (!model || tiersByModel[model]) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/tiers?model=${model}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiersByModel((prev) => ({ ...prev, [model]: res.data }));
    } catch (err) {
      console.error("Erreur chargement des tiers :", err);
      setTiersByModel((prev) => ({ ...prev, [model]: [] }));
    }
  };

  const handleLineChange = async (index, name, value) => {
    if (!isEditing || index < savedMouvements.length) return;
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
    if (index < savedMouvements.length) {
      setError("❌ Vous ne pouvez pas supprimer un mouvement déjà sauvegardé.");
      return;
    }
    if (mouvements.length === savedMouvements.length + 1) {
      setError("❌ Vous devez avoir au moins une ligne de mouvement en cours.");
      return;
    }
    setMouvements((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isEditing) return;

    const token = localStorage.getItem("token");
    if (!form.caisse || !form.utilisateur) {
      setError("❌ Veuillez choisir une caisse et être connecté.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");
      
      const newMouvements = mouvements.slice(savedMouvements.length);
      const mouvementsToSend = newMouvements.map(mvt => ({
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
      }, { headers: { Authorization: `Bearer ${token}` } });

      await loadCaisseSolde(form.caisse);
      const updatedRecent = await loadRecentMouvements(form.caisse);
      setSavedMouvements(updatedRecent);

      setMouvements([
        ...updatedRecent,
        {
          date: new Date().toISOString().split("T")[0],
          description: "",
          typeMouvement: "decaissement",
          montant: "",
          tierModel: "",
          tier: "",
          natureCharge: "",
        },
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("❌ Solde insuffisant pour ce décaissement ou autre erreur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadCaisseSolde = async (caisseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/caisses/${caisseId}/solde`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSoldeInitialCaisse(res.data.soldeInitial);
      setSoldeCaisseAvantNouveauxMouvements(res.data.soldeCalcule);
    } catch (err) {
      console.error("❌ Erreur récupération solde dynamique :", err);
      setSoldeInitialCaisse(0);
      setSoldeCaisseAvantNouveauxMouvements(0);
    }
  };

  const handleDownloadJournal = async (format) => {
    if (!form.caisse) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Session expirée ou non autorisée. Veuillez vous reconnecter.");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/rapports/journal-caisse`, {
        params: { caisseId: form.caisse, format },
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` }
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

  const totalMouvementsEnCours = mouvements.slice(savedMouvements.length).reduce((acc, mvt) => {
    const montantNum = parseFloat(mvt.montant) || 0;
    return mvt.typeMouvement === "decaissement" ? acc - montantNum : acc + montantNum;
  }, 0);

  const soldeActuelCalcule = soldeCaisseAvantNouveauxMouvements + totalMouvementsEnCours;

  const totalMouvementsAffiches = totalMouvementsEnCours + mouvements.slice(0, savedMouvements.length).reduce((acc, mvt) => {
    const montantNum = parseFloat(mvt.montant) || 0;
    return mvt.typeMouvement === "decaissement" ? acc - montantNum : acc + montantNum;
  }, 0);

  const openTierModal = (model) => {
    setSelectedModelForModal(model);
    setTierModalOpen(true);
  };

  const createTier = async (newTier) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Erreur: Session non autorisée.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/tiers", newTier, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiersByModel((prev) => ({
        ...prev,
        [newTier.model]: [...(prev[newTier.model] || []), res.data],
      }));
      setTierModalOpen(false);
    } catch (err) {
      alert("Erreur création tiers : " + err.message);
    }
  };

  const createNature = async (newNature) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Erreur: Session non autorisée.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/nature-charges", newNature, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Erreur: Session non autorisée.");
      return;
    }
    try {
      const payload = { ...newCaisse, societe: currentUser?.societe };
      const res = await axios.post("http://localhost:5000/api/caisses", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaisses(prev => [...prev, res.data]);
      setForm(prev => ({ ...prev, caisse: res.data._id }));
      setIsCaisseModalOpen(false);
    } catch (err) {
      console.error("Erreur création caisse :", err);
      alert("Erreur lors de la création de la caisse.");
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

          {isEditing && (
            <button
              type="submit"
              form="mouvement-form"
              disabled={isSubmitting || !form.caisse}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg transition-colors shadow-md ${
                isSubmitting || !form.caisse
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
                <p className="font-semibold">{(soldeInitialCaisse.toFixed(2)|| 0)} DT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total mouvements</p>
                <p className={`font-semibold ${
                  totalMouvementsAffiches >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {totalMouvementsAffiches.toFixed(2)} DT
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
                const isRecentMovement = index < savedMouvements.length;
                const isDisabled = !isEditing || isRecentMovement;
                const textColor = mvt.typeMouvement === 'encaissement' 
                  ? 'text-green-700' 
                  : 'text-red-700';
                
                return (
                  <tr 
                    key={index} 
                    className={`hover:bg-purple-50 transition-colors ${isDisabled ? 'bg-gray-100' : ''} ${textColor}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="date"
                        value={mvt.date}
                        onChange={(e) => handleLineChange(index, "date", e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={mvt.description}
                        onChange={(e) => handleLineChange(index, "description", e.target.value)}
                        placeholder="Description"
                        className={`w-full px-2 py-1 border rounded-md ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mvt.typeMouvement}
                        onChange={(e) => handleLineChange(index, "typeMouvement", e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={isDisabled}
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
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={isDisabled}
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
                            isDisabled 
                              ? 'border-gray-200 bg-gray-100' 
                              : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                          }`}
                          disabled={isDisabled}
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
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        disabled={isDisabled}
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
                        disabled={!mvt.tierModel || isDisabled}
                        className={`w-full px-2 py-1 border rounded-md ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100' 
                            : 'border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-transparent'
                        }`}
                      >
                        <option value="">-- Tiers --</option>
                        {(tiersByModel[mvt.tierModel] || []).map((t, idx) => (
                          <option key={idx} value={t._id}>
                            {t.rsoc || t.libelle || t.nomComplet || t.matricule || t.numeroCompte || 'Nom non trouvé'}
                          </option>
                        ))}
                        <option value="__new">➕ Nouveau...</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing && index >= savedMouvements.length && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>
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