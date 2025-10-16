import React, { useEffect, useState } from "react";
import api from "../../api";
import { handleError, handleSuccess } from "../../utils/toastUtils";
import { ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save, XCircle } from 'lucide-react'; 

export default function SocieteEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSociete = async () => {
      try {
        const { data } = await api.get(`/companies/${id}`);
        setName(data.name);
        setAddress(data.address || "");
      } catch (error) {
        handleError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSociete();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      handleError("Le nom de la société est requis");
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.put(`/companies/${id}`, { name, address });
      handleSuccess("Société mise à jour avec succès !");
      setSaving(false);
      navigate("/societes"); 
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-purple-600 h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Modifier la Société
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nom de la société <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex : Société ABC"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Adresse
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex : 123 rue de Tunis"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button" 
            onClick={handleCancel}
            className="flex items-center px-6 py-3 rounded-lg text-gray-700 font-medium transition-colors border border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              saving
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="mr-2" size={20} />
                Mettre à jour
              </>
            )}
          </button>
        </div>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  );
}