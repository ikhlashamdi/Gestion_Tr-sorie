import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CaisseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    libelle: "",
    soldeInitial: 0,
    seuilMax: 0,
    utilisateur: "",
    societe: "",
    code: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ Vous devez être connecté.");
        setLoadingUser(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
        setForm((prev) => ({
          ...prev,
          utilisateur: res.data._id,
          societe: res.data.societe || "ERP TOGO",
          
        }));
      } catch (err) {
        setError("❌ Impossible de récupérer l'utilisateur connecté.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5000/api/caisses/${id}`)
        .then((res) => {
          setForm({
            libelle: res.data.libelle,
            soldeInitial: res.data.soldeInitial,
            seuilMax: res.data.seuilMax,
            utilisateur: res.data.utilisateur?._id || "",
            societe: res.data.societe || "",
            code: res.data.code || "",
          });
        })
        .catch((err) => {
          console.error("Erreur récupération caisse :", err);
          navigate("/caisse");
        });
    }
  }, [id, navigate]);

const handleChange = (e) => {
  const { name, value } = e.target;

  // Si c’est un champ numérique
  const numericFields = ["soldeInitial", "seuilMaximal", "seuilMinimal"];
  setForm((prevForm) => ({
    ...prevForm,
    [name]: numericFields.includes(name) ? Number(value) : value
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

if (form.seuilMax && form.seuilMax > 0 && form.soldeInitial > form.seuilMax) {
      setError("❌ Le solde initial ne peut pas dépasser le seuil maximal.");
      return;
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/caisses/${id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/caisses", form);
      }
      navigate("/caisse");
    } catch (err) {
      const message = err?.response?.data?.error || "❌ Erreur lors de l'enregistrement.";
      setError(message);
    }
  };

  if (loadingUser) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des données utilisateur...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id ? "Modifier Caisse" : "Nouvelle Caisse"}
            </h1>
            <p className="text-gray-500 mt-1">
              {id ? "Mettre à jour les informations de la caisse" : "Créer une nouvelle caisse pour votre société"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/caisse")}
              className="flex items-center text-gray-500 hover:text-gray-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200 mt-4"></div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Libellé</label>
                <div className="relative">
                  <input
                    type="text"
                    name="libelle"
                    value={form.libelle}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nom de la caisse"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                </div>
              </div>

<div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-2">Solde caisse</label>
  <div className="relative">
    <input
      type="number"
      name="soldeInitial"
      value={form.soldeInitial || ""}
      onChange={handleChange}
      min="0"
      step="0.01"
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      placeholder="0.00"
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>

<div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-2">Seuil maximal de la caisse</label>
  <div className="relative">
    <input
      type="number"
      name="seuilMax"
      value={form.seuilMax === 0 ? 0 : form.seuilMax || ""}
      onChange={handleChange}
      min="0"
      step="0.01"
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      placeholder="0.00"
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.3-.25.555-.548.653l-3.108 1.11a1 1 0 01-1.303-.617L7.28 11.96a.5.5 0 00-.94 0l-1.17 3.137a1 1 0 01-1.303.617l-3.11-1.11a1 1 0 01-.547-.653L.854 7.2 5.033 2.744A1 1 0 016 2h6zm-.5 4a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>
</div>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Utilisateur</label>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900">{currentUser?.name || "Administrator"}</h3>
                    <p className="text-sm text-gray-500">Utilisateur connecté</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Société</label>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-purple-100 rounded-xl w-16 h-16 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900">{currentUser?.societe || "ERP TOGO"}</h3>
                    <p className="text-sm text-gray-500">Société enregistrée</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/caisse")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-bold"
            >
              ANNULER
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg text-white font-bold transition-colors shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {id ? "ENREGISTRER LES MODIFICATIONS" : "AJOUTER LA CAISSE"}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}