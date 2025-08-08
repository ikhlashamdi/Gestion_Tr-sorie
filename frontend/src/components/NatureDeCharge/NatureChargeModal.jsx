import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const generateNextCode = (natureCharges) => {
  if (!natureCharges || natureCharges.length === 0) return "NC01";
  
  const codes = natureCharges
    .map((n) => n.code)
    .filter(code => /^NC\d+$/.test(code));
    
  if (codes.length === 0) return "NC01";
  
  const maxNumber = Math.max(
    ...codes.map(code => parseInt(code.replace("NC", ""), 10)
  ));
  
  return `NC${(maxNumber + 1).toString().padStart(2, '0')}`;
};

export default function NatureChargeModal({
  open,
  onClose,
  onSubmit,
  natureCharge,
  natureCharges
}) {
  const [form, setForm] = useState({ code: "", libelle: "" });
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!natureCharge) {
      setForm({
        code: generateNextCode(natureCharges),
        libelle: ""
      });
    } else {
      setForm(natureCharge);
    }
  }, [natureCharge, open, natureCharges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.libelle.trim()) {
      setError("Le libellé est requis");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    const isDuplicate = natureCharges.some(
      n => n.libelle.toLowerCase() === form.libelle.toLowerCase() && 
           n._id !== natureCharge?._id
    );
    
    if (isDuplicate) {
      setError("Cette nature existe déjà");
      return;
    }
    
    onSubmit(form);
  };

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {natureCharge ? "Modifier Nature" : "Nouvelle Nature de Charge"}
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Description de la nature"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              {natureCharge ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}