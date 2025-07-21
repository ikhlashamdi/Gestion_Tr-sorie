import React, { useEffect, useState } from "react";
import axios from "axios";
import TierModal from "./TierModal";
import TierTable from "./TierTable";

export default function TierList() {
  const [tiers, setTiers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // 🔍 Fonction de recherche
  const fetchTiers = async (search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tiers?search=${search}`);
      setTiers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tiers :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce tier ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tiers/${id}`);
      fetchTiers();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleEdit = (tier) => {
    setSelectedTier(tier);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedTier(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedTier) {
        await axios.put(`http://localhost:5000/api/tiers/${selectedTier._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/tiers", form);
      }
      fetchTiers();
      setOpenModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <div className="w-full">
      <TierTable
        tiers={tiers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchTiers}
      />

      <TierModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        tier={selectedTier}
        tiers={tiers}
      />
    </div>
  );
}
