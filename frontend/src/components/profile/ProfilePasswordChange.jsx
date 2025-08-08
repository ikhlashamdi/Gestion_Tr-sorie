import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfilePasswordChange() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 4000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("❌ Les mots de passe ne correspondent pas.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("⚠️ Le nouveau mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/users/change-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showMessage("✅ Mot de passe modifié avec succès. Redirection en cours...");
      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "❌ Erreur lors du changement du mot de passe.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Changer le mot de passe</h2>

      {message && (
        <div
          role="alert"
          className={`mb-6 p-4 rounded text-center text-sm font-semibold transition-opacity duration-300 ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <label className="block mb-2 font-semibold text-gray-700">Ancien mot de passe</label>
      <input
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        disabled={loading}
        className="w-full mb-6 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        placeholder="Entrez votre ancien mot de passe"
      />

      <label className="block mb-2 font-semibold text-gray-700">Nouveau mot de passe</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={loading}
        className="w-full mb-6 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        placeholder="Entrez un nouveau mot de passe"
      />

      <label className="block mb-2 font-semibold text-gray-700">Confirmer le mot de passe</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
        className="w-full mb-6 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        placeholder="Confirmez le nouveau mot de passe"
      />

      <button
        onClick={handlePasswordChange}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Modification en cours..." : "Modifier le mot de passe"}
      </button>
    </div>
  );
}
