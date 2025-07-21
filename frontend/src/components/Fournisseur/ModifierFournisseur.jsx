import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import FournisseurForm from "./FournisseurForm";
import Layout from "../common/Layout";

export default function ModifierFournisseur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fournisseur, setFournisseur] = useState(null);

  useEffect(() => {
    const fetchFournisseur = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/fournisseurs/${id}`);
        setFournisseur(res.data);
      } catch (err) {
        console.error("Erreur récupération fournisseur :", err);
      }
    };

    fetchFournisseur();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await axios.put(`http://localhost:5000/api/fournisseurs/${id}`, formData);
      navigate("/fournisseurs");
    } catch (err) {
      console.error("Erreur modification fournisseur :", err);
    }
  };

  return (
    <Layout>
      {fournisseur && (
        <FournisseurForm
          fournisseur={fournisseur}
          onSubmit={handleUpdate}
          onCancel={() => navigate("/fournisseurs")}
          isEdit={true}
        />
      )}
    </Layout>
  );
}
