// src/pages/caisse/CaisseList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CaisseTable from "./CaisseTable";

export default function CaisseList() {
  const [caisses, setCaisses] = useState([]);
  const navigate = useNavigate();

  const fetchCaisses = async (search = "") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/caisses?search=${search}`);
      setCaisses(res.data);
    } catch (err) {
      console.error("Erreur récupération des caisses", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette caisse ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/caisses/${id}`);
      fetchCaisses();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEdit = (caisse) => navigate(`/caisses/${caisse._id}`);
  const handleAdd = () => navigate("/caisses/nouveau");

  useEffect(() => {
    fetchCaisses();
  }, []);

  return (
    <CaisseTable
      caisses={caisses}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      onSearch={fetchCaisses}
    />
  );
}
