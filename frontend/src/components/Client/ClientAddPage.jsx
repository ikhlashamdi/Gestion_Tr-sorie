import React, { useEffect, useState } from "react";
import ClientForm from "./ClientForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../common/Layout";

export default function ClientAddPage() {
  const navigate = useNavigate();
  const [initialClient, setInitialClient] = useState(null);

  useEffect(() => {
    const generateCode = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clients");
        const clients = res.data;
        const max = clients.reduce((acc, c) => {
          const num = parseInt(c.code?.split("-")[1]) || 0;
          return num > acc ? num : acc;
        }, 0);
        const newCode = `CL-${String(max + 1).padStart(2, "0")}`;
        setInitialClient({ code: newCode, rsoc: "", mf: "", tel: "" });
      } catch (err) {
        console.error("Erreur génération code client :", err);
      }
    };

    generateCode();
  }, []);

  const handleCreate = async (form) => {
    try {
      await axios.post("http://localhost:5000/api/clients", form);
      navigate("/clients");
    } catch (err) {
      console.error("Erreur lors de l’ajout :", err);
    }
  };

  return (
    <Layout>
      {initialClient && (
        <ClientForm
          client={initialClient}
          onSubmit={handleCreate}
          onCancel={() => navigate("/clients")}
          isEdit={false}
        />
      )}
    </Layout>
  );
}
