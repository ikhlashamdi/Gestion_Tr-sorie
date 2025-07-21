import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FournisseurForm from "./FournisseurForm";
import Layout from "../common/Layout";

export default function AjouterFournisseur() {
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/fournisseurs");
        const fournisseurs = res.data;

        const generateNextCode = () => {
          const codes = fournisseurs
            .map((f) => f.code)
            .filter((c) => /^FO\d+$/i.test(c));
          if (codes.length === 0) return "FO01";

          const maxNum = Math.max(...codes.map((c) => parseInt(c.replace("FO", ""), 10)));
          return "FO" + String(maxNum + 1).padStart(2, "0");
        };

        const nextCode = generateNextCode();

        setInitialData({
          code: nextCode,
          rsoc: "",
          adresse: "",
          mf: "",
          tel: "",
          email: "",
        });
      } catch (err) {
        console.error("Erreur lors du chargement des fournisseurs :", err);
      }
    };

    fetchFournisseurs();
  }, []);

  const handleAdd = async (formData) => {
    try {
      await axios.post("http://localhost:5000/api/fournisseurs", formData);
      navigate("/fournisseurs");
    } catch (err) {
      console.error("Erreur ajout fournisseur :", err);
    }
  };

  return (
    <Layout>
      {initialData && (
        <FournisseurForm
          onSubmit={handleAdd}
          onCancel={() => navigate("/fournisseurs")}
          fournisseur={initialData}
          isEdit={false}
        />
      )}
    </Layout>
  );
}
