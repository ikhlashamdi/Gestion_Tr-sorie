import React, { useEffect, useState } from "react";
import axios from "axios";
import NatureChargeModal from "./NatureChargeModal";
import NatureChargeTable from "./NatureChargeTable";

export default function NatureChargeList() {
  const [natureCharges, setNatureCharges] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNatureCharge, setSelectedNatureCharge] = useState(null);

  // 🔍 Fonction de recherche avec paramètre
  const fetchNatureCharges = async (search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/nature-charges?search=${search}`);
      setNatureCharges(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des natures de charge :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette nature de charge ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/nature-charges/${id}`);
      fetchNatureCharges();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleEdit = (natureCharge) => {
    setSelectedNatureCharge(natureCharge);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedNatureCharge(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedNatureCharge) {
        await axios.put(`http://localhost:5000/api/nature-charges/${selectedNatureCharge._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/nature-charges", form);
      }
      fetchNatureCharges();
      setOpenModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  useEffect(() => {
    fetchNatureCharges();
  }, []);

  return (
    <div className="w-full">
      <NatureChargeTable
        natureCharges={natureCharges}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchNatureCharges}
      />

      <NatureChargeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        natureCharge={selectedNatureCharge}
        natureCharges={natureCharges}
      />
    </div>
  );
}
