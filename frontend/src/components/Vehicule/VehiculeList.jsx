import React, { useEffect, useState } from "react";
import axios from "axios";
import VehiculeModal from "./VehiculeModal";
import VehiculeTable from "./VehiculeTable";

export default function VehiculeList() {
  const [vehicules, setVehicules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  // Recherche avec paramètre facultatif
  const fetchVehicules = async (search = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/vehicules?search=${encodeURIComponent(search)}`
      );
      setVehicules(response.data);
    } catch (err) {
      console.error("Erreur chargement véhicules :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/vehicules/${id}`);
      fetchVehicules();
    } catch (err) {
      console.error("Erreur suppression véhicule :", err);
    }
  };

  const handleEdit = (vehicule) => {
    setSelectedVehicule(vehicule);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedVehicule(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedVehicule) {
        await axios.put(
          `http://localhost:5000/api/vehicules/${selectedVehicule._id}`,
          form
        );
      } else {
        await axios.post("http://localhost:5000/api/vehicules", form);
      }
      fetchVehicules();
      setOpenModal(false);
    } catch (err) {
      console.error("Erreur enregistrement véhicule :", err);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <VehiculeTable
        vehicules={vehicules}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchVehicules}
      />

     <VehiculeModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onCreated={handleModalSubmit}  // au lieu de onSubmit
  vehicule={selectedVehicule}
  vehicules={vehicules}
/>

    </div>
  );
}
