import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TierTable from "./TierTable";

export default function TierList() {
  const [tiers, setTiers] = useState([]);
  const navigate = useNavigate();

  const fetchTiers = async (search = "") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/autre?search=${search}`);
      setTiers(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des tiers :", err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer ce tier ?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/autre/${id}`);
      fetchTiers();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleEdit = (tier) => {
    navigate(`/tiers/${tier._id}`);
  };

  const handleAdd = () => {
    navigate("/tiers/nouveau");
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <TierTable
      tiers={tiers}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      onSearch={fetchTiers}
    />
  );
}
