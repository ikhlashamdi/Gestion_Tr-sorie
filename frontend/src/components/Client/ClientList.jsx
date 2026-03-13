import React, { useEffect, useState } from "react";
import axios from "axios";
import ClientTable from "./ClientTable";
import { useNavigate } from "react-router-dom";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  const fetchClients = async (search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clients?search=${search}`);
      setClients(response.data);
    } catch (error) {
      console.error(" Erreur récupération des clients :", error);
    }
  };

  const handleAdd = () => {
    navigate("/clients/add");
  };

  const handleEdit = (client) => {
    navigate(`/clients/edit/${client._id}`);
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`);
      fetchClients();
    } catch (error) {
      console.error(" Erreur suppression :", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="w-full">
      <ClientTable
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSearch={fetchClients}
      />
    </div>
  );
}
