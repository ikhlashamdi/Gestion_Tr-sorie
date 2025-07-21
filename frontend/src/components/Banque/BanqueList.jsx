import React, { useEffect, useState } from "react";
import axios from "axios";
import BanqueModal from "./BanqueModal";
import BanqueTable from "./BanqueTable";

export default function BanqueList() {
  const [banques, setBanques] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);

  const fetchBanques = async (search = '') => {
    try {
      const res = await axios.get(`http://localhost:5000/api/banques?search=${search}`);
      setBanques(res.data);
    } catch (err) {
      console.error("Erreur chargement banques :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette banque ?")) return;
    await axios.delete(`http://localhost:5000/api/banques/${id}`);
    fetchBanques();
  };

  const handleEdit = (banque) => {
    setSelectedBanque(banque);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedBanque(null);
    setOpenModal(true);
  };

  const handleModalSubmit = async (form) => {
    try {
      if (selectedBanque) {
        await axios.put(`http://localhost:5000/api/banques/${selectedBanque._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/banques", form);
      }
      fetchBanques();
      setOpenModal(false);
    } catch (err) {
      console.error("Erreur enregistrement :", err);
    }
  };

  useEffect(() => {
    fetchBanques();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <BanqueTable
        banques={banques}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchBanques}
      />
      <BanqueModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        banque={selectedBanque}
        banques={banques}
      />
    </div>
  );
}
