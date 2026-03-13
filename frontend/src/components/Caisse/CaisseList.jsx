import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CaisseTable from "./CaisseTable";

export default function CaisseList() {
  const [caisses, setCaisses] = useState([]);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchCaisses(storedToken); 
    }

    const handleCompanyChange = () => {
      if (storedToken) fetchCaisses(storedToken);
    };
    window.addEventListener("companyChanged", handleCompanyChange);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
    };
  }, []);

  const fetchCaisses = async (tokenParam, search = "") => {
    const t = tokenParam || token;
    if (!t) {
      console.warn("Token non disponible. Impossible de récupérer les caisses.");
      return;
    }

    try {
      const selectedCompanyId = localStorage.getItem("selectedCompanyId"); 

      const res = await axios.get("http://localhost:5000/api/caisses", {
        headers: {
          Authorization: `Bearer ${t}`,
        },
        params: {
          search,
          companyId: selectedCompanyId,
        },
      });

      setCaisses(res.data);
    } catch (err) {
      console.error("Erreur récupération des caisses :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette caisse ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/caisses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCaisses(); 
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEdit = (caisse) => navigate(`/caisses/${caisse._id}`);

  const handleAdd = () => navigate("/caisses/nouveau");

  return (
    <CaisseTable
      caisses={caisses}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      onSearch={(search) => fetchCaisses(null, search)}
    />
  );
}
