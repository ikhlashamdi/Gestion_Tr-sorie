import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FournisseurTable from "./FournisseurTable";

export default function FournisseurList() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const navigate = useNavigate();


  const fetchFournisseurs = async (search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/fournisseurs?search=${search}`);
      setFournisseurs(response.data);
    } catch (error) {
      console.error(" Erreur récupération des fournisseurs :", error);
    }
  };


  const handleAdd = () => {
    navigate("/fournisseurs/ajouter");
  };


  const handleEdit = (fournisseur) => {
    navigate(`/fournisseurs/modifier/${fournisseur._id}`);
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce fournisseur ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fournisseurs/${id}`);
      fetchFournisseurs();
    } catch (error) {
      console.error(" Erreur suppression :", error);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  return (
    <div className="w-full">
      <FournisseurTable
        fournisseurs={fournisseurs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchFournisseurs}
      />
    </div>
  );
}
