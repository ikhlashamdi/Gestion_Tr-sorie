import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Camera, Trash2, UserCircle } from "lucide-react";

const ImageDropzone = ({ onFileChange, preview, loading }) => {
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
        loading ? "border-gray-300 bg-gray-100" : "border-gray-400 hover:border-blue-500 hover:bg-blue-50"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="text-center">
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="w-32 h-32 rounded-full object-cover shadow-lg mx-auto mb-4"
          />
        ) : (
          <UserCircle size={96} className="text-gray-400 mx-auto mb-4" />
        )}
        <p className="font-semibold text-gray-700">
          Glissez-déposez une image ou cliquez pour la sélectionner
        </p>
        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
      </div>
    </div>
  );
};

export default function ProfileImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!file) {
      toast.error("Veuillez choisir une image.");
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

      toast.success("Image de profil mise à jour !");
      setFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'envoi de l'image."
      );
    } finally {
      setLoading(false);
    }
  }, [file, token]);

  return (
    <div className="max-w-xl mx-auto">
      <Toaster position="top-center" />
      <div className="p-8 bg-gray-50 rounded-2xl shadow-inner">
        <ImageDropzone onFileChange={onFileChange} preview={preview} loading={loading} />

        <div className="flex justify-end mt-6 space-x-4">
          {file && (
            <button
              onClick={() => setFile(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 size={18} />
              <span>Annuler</span>
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={loading || !file}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition ${
              loading || !file ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              <>
                <Camera size={18} />
                <span>Sauvegarder l'image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}