import React, { useEffect, useState } from "react";
import axios from "axios";
import PersonnelModal from "./PersonnelModal";
import PersonnelTable from "./PersonnelTable";

export default function PersonnelList() {
  const [personnels, setPersonnels] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  const fetchPersonnels = async (search = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/personnels?search=${search}`);
      setPersonnels(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des personnels :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce personnel ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/personnels/${id}`);
      fetchPersonnels();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleEdit = (personnel) => {
    setSelectedPersonnel(personnel);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedPersonnel(null);
    setOpenModal(true);
  };

  // Ici on gère la création ou la mise à jour
  const handleModalSubmit = async (form) => {
    try {
      if (selectedPersonnel) {
        // Modification
        await axios.put(`http://localhost:5000/api/personnels/${selectedPersonnel._id}`, form);
      } else {
        // Création
        await axios.post("http://localhost:5000/api/personnels", form);
      }
      await fetchPersonnels();
      setOpenModal(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      if (err.response && err.response.status === 400 && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    }
  };

  useEffect(() => {
    fetchPersonnels();
  }, []);

  return (
    <div className="w-full">
      <PersonnelTable
        personnels={personnels}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchPersonnels}
      />

      <PersonnelModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={handleModalSubmit}
        personnel={selectedPersonnel}
        personnels={personnels}
      />
    </div>
  );
}
