import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ClientForm from "./ClientForm";
import Layout from "../common/Layout"; 

export default function ClientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/clients/${id}`);
        setClient(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération du client :", err);
        navigate("/clients");
      }
    };
    fetchClient();
  }, [id, navigate]);

  const handleUpdate = async (form) => {
    try {
      await axios.put(`http://localhost:5000/api/clients/${id}`, form);
      navigate("/clients");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du client :", err);
    }
  };

  if (!client) {
    return (
      <Layout>
        <p className="text-center mt-10">Chargement du client...</p>
      </Layout>
    );
  }

  return (
    <Layout>
    <ClientForm
  client={client}
  onSubmit={handleUpdate}
  onCancel={() => navigate("/clients")}
  isEdit={true}
/>

    </Layout>
  );
}
