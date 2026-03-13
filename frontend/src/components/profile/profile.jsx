import React, { useState } from "react";
import ProfileImageUpload from "./ProfileImageUpload";
import ProfilePasswordChange from "./ProfilePasswordChange";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("image");

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        Gérer Mon Profil
      </h1>

      <div className="flex justify-center mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("image")}
          className={`px-6 py-3 font-semibold text-lg transition-all duration-300 ${
            activeTab === "image"
              ? "border-b-4 border-indigo-600 text-indigo-600"
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          Modifier l'image
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-6 py-3 font-semibold text-lg transition-all duration-300 ${
            activeTab === "password"
              ? "border-b-4 border-indigo-600 text-indigo-600"
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          Changer le mot de passe
        </button>
      </div>

      <div className="py-8">
        {activeTab === "image" && <ProfileImageUpload />}
        {activeTab === "password" && <ProfilePasswordChange />}
      </div>
    </div>
  );
}