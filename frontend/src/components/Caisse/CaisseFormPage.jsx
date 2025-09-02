import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CaisseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loadingAssignableUsers, setLoadingAssignableUsers] = useState(false);

  const [availableSocietes, setAvailableSocietes] = useState([]);
  const [filteredSocietes, setFilteredSocietes] = useState([]);
  const [loadingSocietes, setLoadingSocietes] = useState(false);

  const [fetchedCaisse, setFetchedCaisse] = useState(null);

  const [form, setForm] = useState({
    libelle: "",
    soldeInitial: 0,
    seuilMax: 0,
    utilisateur: "",
    societe: "",
    code: "",
  });

  // 1️⃣ Récupération du token et utilisateur courant
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setError("❌ Vous devez être connecté.");
        setLoadingUser(false);
        return;
      }
      setToken(storedToken);

      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        setError("❌ Impossible de récupérer l'utilisateur connecté.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // 2️⃣ Récupération des utilisateurs assignables pour admin ou super-admin
  useEffect(() => {
    const fetchAssignableUsers = async () => {
      if (!token || !currentUser) return;
      setLoadingAssignableUsers(true);

      try {
        let apiUrl;
        if (currentUser.role === "admin" && currentUser.societes?.length > 0) {
          apiUrl = `http://localhost:5000/api/users/societes/${currentUser.societes.join(",")}`;
        } else if (currentUser.role === "super-admin") {
          apiUrl = "http://localhost:5000/api/users";
        } else {
          setLoadingAssignableUsers(false);
          return;
        }

        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredUsers = res.data.filter(
          (user) => user.role === "caissier" || user.role === "responsable"
        );
        setAssignableUsers(filteredUsers);
      } catch (err) {
        console.error("Erreur récupération utilisateurs assignables :", err);
        setError("❌ Impossible de charger la liste des utilisateurs.");
      } finally {
        setLoadingAssignableUsers(false);
      }
    };

    fetchAssignableUsers();
  }, [currentUser, token]);

  // 3️⃣ Récupération des sociétés pour super-admin
  useEffect(() => {
    const fetchSocietes = async () => {
      if (!token || !currentUser) return;
      if (currentUser.role !== "super-admin") return;

      setLoadingSocietes(true);
      try {
        const res = await axios.get("http://localhost:5000/api/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableSocietes(res.data);
        setFilteredSocietes(res.data);
      } catch (err) {
        console.error("Erreur récupération sociétés :", err);
        setError("❌ Impossible de charger les sociétés.");
      } finally {
        setLoadingSocietes(false);
      }
    };
    fetchSocietes();
  }, [currentUser, token]);

  // 4️⃣ Récupération d'une caisse existante
  useEffect(() => {
    const fetchCaisse = async () => {
      if (id && token) {
        try {
          const res = await axios.get(`http://localhost:5000/api/caisses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFetchedCaisse(res.data);
        } catch (err) {
          console.error("Erreur récupération caisse :", err);
          navigate("/caisse");
        }
      }
    };
    fetchCaisse();
  }, [id, token, navigate]);

  // 5️⃣ Appliquer la caisse au formulaire
  useEffect(() => {
    if (fetchedCaisse) {
      setForm({
        libelle: fetchedCaisse.libelle,
        soldeInitial: fetchedCaisse.soldeInitial,
        seuilMax: fetchedCaisse.seuilMax,
        utilisateur: fetchedCaisse.utilisateur?._id || "",
        societe: fetchedCaisse.societe?._id || "",
        code: fetchedCaisse.code || "",
      });

      if (fetchedCaisse.utilisateur?.societes?.length > 0) {
        const userSocieteIds = fetchedCaisse.utilisateur.societes.map(s => s._id || s);
        setFilteredSocietes(
          availableSocietes.filter(soc => userSocieteIds.includes(soc._id))
        );
      }
    }
  }, [fetchedCaisse, availableSocietes]);

  // 6️⃣ Gestion changement champs formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "utilisateur") {
      const selectedUser = assignableUsers.find((user) => user._id === value);

      if (selectedUser?.societes?.length > 0) {
        const userSocieteIds = selectedUser.societes.map(s => typeof s === "object" ? s._id : s);
        const filtered = availableSocietes.filter(soc => userSocieteIds.includes(soc._id));
        setFilteredSocietes(filtered);

        setForm(prev => ({
          ...prev,
          utilisateur: value,
          societe: filtered.length === 1 ? filtered[0]._id : "",
        }));
      } else {
        setFilteredSocietes([]);
        setForm(prev => ({ ...prev, utilisateur: value, societe: "" }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        [name]: ["soldeInitial", "seuilMax"].includes(name) ? Number(value) : value,
      }));
    }
  };

  // 7️⃣ Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.seuilMax > 0 && form.soldeInitial > form.seuilMax) {
      setError("❌ Le solde initial ne peut pas dépasser le seuil maximal.");
      return;
    }

    if (!token) {
      setError("Token manquant.");
      return;
    }

    const payload = { ...form };
    if (currentUser?.role === "admin") delete payload.societe;
    if (currentUser?.role === "super-admin" && !payload.societe) {
      setError("❌ La société est requise pour le Super-Admin.");
      return;
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/caisses/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:5000/api/caisses", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate("/caisse");
    } catch (err) {
      setError(err?.response?.data?.error || "❌ Erreur lors de l'enregistrement.");
    }
  };

  if (loadingUser || loadingAssignableUsers || loadingSocietes)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{id ? "Modifier Caisse" : "Nouvelle Caisse"}</h1>
        <p className="text-gray-500 mt-1">{id ? "Mettre à jour la caisse" : "Créer une nouvelle caisse"}</p>
        <div className="border-b border-gray-200 mt-4"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Libellé</label>
                <input
                  type="text"
                  name="libelle"
                  value={form.libelle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nom de la caisse"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Solde initial</label>
                <input
                  type="number"
                  name="soldeInitial"
                  value={form.soldeInitial === 0 ? "" : form.soldeInitial}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Seuil maximal</label>
                <input
                  type="number"
                  name="seuilMax"
                  value={form.seuilMax === 0 ? "" : form.seuilMax}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              {(currentUser?.role === "admin" || currentUser?.role === "super-admin") && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Attribuer à un utilisateur</label>
                    <select
                      name="utilisateur"
                      value={form.utilisateur || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Sélectionner un caissier/responsable --</option>
                      {assignableUsers.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Attribuer à une société</label>
                    <select
                      name="societe"
                      value={form.societe || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Sélectionner une société --</option>
                      {filteredSocietes.map(soc => (
                        <option key={soc._id} value={soc._id}>{soc.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {error && <div className="p-4 bg-red-50 border text-red-600 font-medium">{error}</div>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 mt-8 border-t">
            <button type="button" onClick={() => navigate("/caisse")} className="px-6 py-3 border rounded-lg text-gray-700">
              ANNULER
            </button>
            <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-lg">
              {id ? "ENREGISTRER" : "AJOUTER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
