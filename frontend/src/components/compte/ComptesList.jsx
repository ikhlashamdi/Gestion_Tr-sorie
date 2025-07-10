import React, { useEffect, useState } from "react";
import axios from "axios";
import CompteModal from "./CompteModal";
import CompteTable from "./CompteTable";

export default function ComptesList() {
  const [comptes, setComptes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCompte, setSelectedCompte] = useState(null);

  const fetchComptes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/comptescomptables");
      setComptes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes comptables :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce compte ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/comptescomptables/${id}`);
      fetchComptes();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleEdit = (compte) => {
    setSelectedCompte(compte);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedCompte(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedCompte) {
        await axios.put(`http://localhost:5000/api/comptescomptables/${selectedCompte._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/comptescomptables", form);
      }
      fetchComptes();
      setOpenModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  useEffect(() => {
    fetchComptes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Comptes Comptables</h1>
        <button
          onClick={handleAdd}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light transition"
        >
          + Ajouter un Compte
        </button>
      </div>
      <CompteTable comptes={comptes} onEdit={handleEdit} onDelete={handleDelete} />
      <CompteModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        compte={selectedCompte}
      />
    </div>
  );
}