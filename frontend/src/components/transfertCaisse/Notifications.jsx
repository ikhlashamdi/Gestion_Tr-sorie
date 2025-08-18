import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Bell, Check, X, Clock } from "lucide-react"; // Remplacement de FaBell par Bell et ajout d'autres icônes

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  // Fonction pour décoder le token JWT et obtenir l'ID utilisateur
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      console.error("Erreur lors du décodage du token:", e);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ Vous devez être connecté pour voir les notifications.");
      setLoading(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    
    // Fonction pour récupérer les notifications du backend
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/transferts/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des notifications :", err);
        setError("❌ Erreur lors du chargement des notifications.");
        setLoading(false);
      }
    };
    
    fetchNotifications();

    if (!userId) {
        setError("❌ Impossible de récupérer l'ID utilisateur depuis le token.");
        setLoading(false);
        return;
    }

    if (!socketRef.current) {
        // Connecter au serveur Socket.IO
        const socket = io("http://localhost:5000", {
            query: { userId: userId },
            reconnectionAttempts: 5, 
            reconnectionDelay: 1000 
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Connecté au serveur de notifications.");
        });

        socket.on("disconnect", (reason) => {
            console.log("Déconnecté de Socket.IO. Raison:", reason);
        });
    
        // Écouter les nouveaux événements de demande de transfert
        socket.on("demande_transfert", (data) => {
          fetchNotifications(); // Rafraîchir la liste complète des notifications
        });
    
        // Écouter les événements d'acceptation de transfert
        socket.on("transfert_accepte", (data) => {
          fetchNotifications(); // Rafraîchir la liste complète des notifications
        });

        // Écouter les mises à jour générales des notifications
        socket.on("notifications_updated", () => {
          fetchNotifications();
        });
    }

    return () => {
      if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
      }
    };
  }, []);

  // Fonction pour gérer l'acceptation d'un transfert
  const handleAccept = async (transfertId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/transferts/accepter/${transfertId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif._id !== transfertId));
    } catch (err) {
      console.error("Erreur lors de l'acceptation du transfert :", err);
      setError("❌ Erreur lors de l'acceptation du transfert.");
    }
  };
  
  // Fonction pour gérer l'annulation d'un transfert
  const handleCancel = async (transfertId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/transferts/annuler/${transfertId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif._id !== transfertId));
    } catch (err) {
      console.error("Erreur lors de l'annulation du transfert :", err);
      setError("❌ Erreur lors de l'annulation du transfert.");
    }
  };

  // Créer une copie du tableau et l'inverser pour un affichage "du plus récent au plus ancien"
  const notificationsInversées = [...notifications].reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500">Chargement des notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mt-8">
      <div className="flex items-center mb-4">
        <Bell className="text-2xl text-purple-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <p className="text-gray-600">Vous n'avez aucune nouvelle notification.</p>
      ) : (
        <ul className="space-y-4">
          {notificationsInversées.map((notif, index) => (
            <li
              key={notif._id || index}
              className={`p-4 rounded-lg border-l-4 ${
                notif.type === "demande_transfert"
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-green-50 border-green-400"
              } shadow-sm relative`}
            >
              <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                  <div className="flex items-center text-xs text-gray-500 ml-4 whitespace-nowrap">
                      <Clock className="w-3 h-3 mr-1" />
                      {notif.tempsEcoule}
                  </div>
              </div>
              {notif.type === "demande_transfert" && (
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={() => handleAccept(notif._id)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-md text-sm font-semibold hover:from-purple-700 hover:to-indigo-800 transition-colors"
                  >
                    <Check className="w-4 h-4 mr-1" /> Accepter
                  </button>
                  <button
                    onClick={() => handleCancel(notif._id)}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-1" /> Annuler
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
