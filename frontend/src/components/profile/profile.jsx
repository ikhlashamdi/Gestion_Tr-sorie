import React, { useState } from "react";
import ProfileImageUpload from "./ProfileImageUpload";
import ProfilePasswordChange from "./ProfilePasswordChange";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("image");

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Mon Profil</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-8 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("image")}
          className={`px-6 py-2 font-semibold ${
            activeTab === "image"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Modifier l’image de profil
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-6 py-2 font-semibold ml-6 ${
            activeTab === "password"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Changer le mot de passe
        </button>
      </div>

      {/* Contenu des tabs */}
      <div>
        {activeTab === "image" && <ProfileImageUpload />}
        {activeTab === "password" && <ProfilePasswordChange />}
      </div>
    </div>
  );
}
