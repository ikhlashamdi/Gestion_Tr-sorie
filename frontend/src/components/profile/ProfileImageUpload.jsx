import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function ProfileImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Générer la preview et nettoyer
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const showMessage = useCallback((text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 4000);
  }, []);

  const onFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!file) {
      showMessage("⚠️ Veuillez choisir une image avant d'envoyer.", "error");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      await axios.post("http://localhost:5000/api/users/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showMessage("✅ Image uploadée avec succès !");
      setFile(null);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "❌ Une erreur est survenue lors de l'envoi.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [file, token, showMessage]);

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Modifier l’image de profil</h2>

      {message && (
        <div
          role="alert"
          className={`mb-5 rounded px-4 py-3 text-sm font-semibold transition-opacity duration-500 ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex items-center justify-center w-full rounded-md border border-dashed border-gray-400 py-10 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="h-28 w-28 rounded-full object-cover"
          />
        ) : (
          <span>Sélectionnez une image (jpg, png...)</span>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={loading}
        className="hidden"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`mt-6 w-full rounded bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <svg
            className="mx-auto h-6 w-6 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
            ></path>
          </svg>
        ) : (
          "Sauvegarder l’image"
        )}
      </button>
    </div>
  );
}
