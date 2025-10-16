import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const generateNextClientCode = (clients) => {
  if (!clients || clients.length === 0) return "CL-01";

  const codes = clients
    .map((c) => c.code)
    .filter((code) => /^CL-\d+$/.test(code)); 

  if (codes.length === 0) return "CL-01";

  const max = Math.max(
    ...codes.map((code) => parseInt(code.split("-")[1], 10))
  );

  const nextNumber = (max + 1).toString().padStart(2, "0");
  return `CL-${nextNumber}`;
};

export default function ClientModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    code: "",
    rsoc: "",
    mf: "",
    tel: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clients");
        const nextCode = generateNextClientCode(res.data);
        setForm({
          code: nextCode,
          rsoc: "",
          mf: "",
          tel: "",
          email: "",
        });
      } catch (err) {
        console.error("Erreur lors du chargement des clients :", err);
        setError("Erreur lors de la génération du code client.");
      }
    };

    fetchClients();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rsoc || !form.code) {
      setError("Veuillez remplir au moins le Code et la Raison Sociale.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:5000/api/clients", form);
      onCreated("Client", res.data);
      setForm({
        code: "",
        rsoc: "",
        mf: "",
        tel: "",
        email: "",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Nouveau Client</h2>

        {error && (
          <div className="mb-3 text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Raison Sociale</label>
            <input
              type="text"
              name="rsoc"
              value={form.rsoc}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Matricule Fiscale (MF)</label>
            <input
              type="text"
              name="mf"
              value={form.mf}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              name="tel"
              value={form.tel}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
