import React, { useEffect, useState } from "react";
import axios from "axios";
import CaisseModal from "./CaisseModal";
import CaisseTable from "./CaisseTable";

export default function CaisseList() {
  const [caisses, setCaisses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState(null);

  // Recherche avec paramètre facultatif
  const fetchCaisses = async (search = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/caisses?search=${search}`
      );
      setCaisses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des caisses :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette caisse ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/caisses/${id}`);
      fetchCaisses();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleEdit = (caisse) => {
    setSelectedCaisse(caisse);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedCaisse(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedCaisse) {
        await axios.put(
          `http://localhost:5000/api/caisses/${selectedCaisse._id}`,
          form
        );
      } else {
        await axios.post("http://localhost:5000/api/caisses", form);
      }
      fetchCaisses();
      setOpenModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  useEffect(() => {
    fetchCaisses();
  }, []);

  return (
    <div className="w-full">
      <CaisseTable
        caisses={caisses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchCaisses}
      />

      <CaisseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        caisse={selectedCaisse}
        caisses={caisses} 
      />
    </div>
  );
}
