import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NatureChargeTable from "./NatureChargeTable";

export default function NatureChargeList() {
  const [natures, setNatures] = useState([]);
  const navigate = useNavigate();

  const fetchNatures = async (search = "") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/nature-charges?search=${search}`);
      setNatures(res.data);
    } catch (err) {
      console.error("Erreur récupération des natures", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette nature ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/nature-charges/${id}`);
      fetchNatures();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEdit = (nature) => navigate(`/nature-charges/${nature._id}`);
  const handleAdd = () => navigate("/nature-charges/nouveau");

  useEffect(() => {
    fetchNatures();
  }, []);

  return (
    <NatureChargeTable
      natures={natures}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      onSearch={fetchNatures}
    />
  );
}
