import React, { useState } from "react";
import api from "../../api";
import { handleError, handleSuccess } from "../../utils/toastUtils";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function SocieteCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      handleError("Le nom de la société est requis");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/companies", { name, address });
      handleSuccess("Société créée avec succès !");
      setLoading(false);
      navigate("/societes"); 
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Nouvelle Société
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
            className="px-6 py-3 rounded-lg text-gray-700 font-medium transition-colors border border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </button>
          
        
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Création..." : "Créer la société"}
          </button>
        </div>
      </form>

      <ToastContainer position="bottom-right" />
    </div>
  );
}