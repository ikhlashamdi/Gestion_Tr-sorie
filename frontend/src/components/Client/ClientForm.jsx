import React, { useState, useEffect } from "react";
import { UserCheck, UserPlus, Building, Hash, Briefcase, Phone } from "lucide-react";

export default function ClientForm({ onSubmit, client, onCancel, isEdit = false }) {
  const [form, setForm] = useState({
    code: "",
    rsoc: "",
    mf: "",
    tel: "",
  });

  useEffect(() => {
    if (client) {
      setForm(client);
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? "Modifier un Client" : "Nouveau Client"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit
                ? "Mettre à jour les informations du client"
                : "Ajouter un nouveau client à votre société"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="flex items-center text-gray-500 hover:text-gray-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200 mt-4"></div>
      </div>


      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-purple-600" />
                  Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    readOnly={isEdit}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isEdit ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="Code du client"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-purple-600" />
                  Raison Sociale
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rsoc"
                    value={form.rsoc}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Raison sociale du client"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-purple-600" />
                  Matricule Fiscale
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mf"
                    value={form.mf}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Matricule fiscale du client"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-purple-600" />
                  Contact
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contact du client"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-bold"
            >
              ANNULER
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg text-white font-bold transition-colors shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center">
                {isEdit ? (
                  <>
                    <UserCheck className="h-5 w-5 mr-2" />
                    <span>MODIFIER LE CLIENT</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    <span>AJOUTER LE CLIENT</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}