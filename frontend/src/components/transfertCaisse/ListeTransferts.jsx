import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Printer, Search, Calendar, ChevronLeft, ChevronRight, CheckCircle, PackageCheck, FileCheck, ArrowDownToLine, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ListeTransferts() {
  // État des données et du chargement
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // État des filtres
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCaisse, setSelectedCaisse] = useState("");
  const [caisses, setCaisses] = useState([]);
  const [selectedStatut, setSelectedStatut] = useState(""); // NOUVEL ÉTAT

  // État de l'utilisateur et de la pagination
  const [currentUser, setCurrentUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalTransferts, setTotalTransferts] = useState(0);

  // NOUVEL ÉTAT POUR LA VISIBILITÉ DES BOUTONS ET DE LA LISTE
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Fonction pour charger les transferts depuis l'API
  const fetchTransferts = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    setError(""); // Réinitialiser le message d'erreur de l'API
    setValidationMessage(""); // Réinitialiser le message de validation
    setShowExportButtons(false);
    setHasSearched(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ Vous devez être connecté.");
        return;
      }

      const params = {
        page,
        pageSize: size,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCaisse) params.caisse = selectedCaisse;
      if (selectedStatut) params.statut = selectedStatut; // INCLUSION DU FILTRE

      const res = await axios.get("http://localhost:5000/api/transferts", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const transfertsData = res.data.transferts || [];
      const totalData = res.data.total || 0;

      setTransferts(transfertsData);
      setTotalTransferts(totalData);
      setHasSearched(true);

      if (transfertsData.length > 0) {
        setShowExportButtons(true);
      }
    } catch (err) {
      setError("❌ Erreur lors du chargement des transferts.");
      setTransferts([]);
      setTotalTransferts(0);
      setShowExportButtons(false);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche améliorée
  const handleSearch = () => {
    if (!startDate || !endDate) {
      setValidationMessage("Veuillez sélectionner une date de début et de fin.");
      setTransferts([]);
      setTotalTransferts(0);
      setShowExportButtons(false);
      setHasSearched(false);
      return;
    }

    // Réinitialiser la pagination à la première page et lancer la recherche
    setCurrentPage(1);
    fetchTransferts(1, pageSize);
  };

  // Chargement initial des données (caisses, utilisateur) au montage du composant
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ Vous devez être connecté.");
        setLoading(false);
        return;
      }
      try {
        const [caissesRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/caisses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCaisses(caissesRes.data || []);
        setCurrentUser(userRes.data);
      } catch (err) {
        setError("❌ Impossible de charger les données initiales.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Déclencher le fetch des transferts uniquement pour la pagination
  useEffect(() => {
    // Si une recherche a déjà été faite, on peut re-fetch pour la pagination
    if (hasSearched) {
      fetchTransferts();
    }
  }, [currentPage, pageSize]);


  // Fonctions de tri, formatage, etc.
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronLeft size={14} className="inline ml-1 transform rotate-90" /> : <ChevronRight size={14} className="inline ml-1 transform rotate-90" />;
  };

  const sortedTransferts = useMemo(() => {
    const data = Array.isArray(transferts) ? transferts : [];

    return [...data].sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === "montant") {
        return sortConfig.direction === "asc" ? a.montant - b.montant : b.montant - a.montant;
      }

      const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [transferts, sortConfig]);

  const handleImprimer = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/transferts/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transfert_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("❌ Impossible d'imprimer le transfert");
    }
  };

  const totalPages = Math.ceil(totalTransferts / pageSize);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Date invalide";
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORIQUE DES TRANSFERTS", 105, 15, null, null, 'center');

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const periodText = `Période: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Toutes dates'}
      à ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Toutes dates'}`;
      const caisseText = `Caisse: ${selectedCaisse ?
        (caisses.find(c => c._id === selectedCaisse)?.libelle || selectedCaisse) :
        'Toutes les caisses'}`;
      const statutText = `Statut: ${selectedStatut ? selectedStatut : 'Tous les statuts'}`; // AJOUT DU TEXTE DE STATUT

      doc.text(periodText, 15, 25);
      doc.text(caisseText, 15, 30);
      doc.text(statutText, 15, 35); // POSITIONNEMENT DU TEXTE

      const now = new Date();
      const printDate = `Imprimé le: ${now.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })}`;

      const userInfo = `Par: ${currentUser?.name || currentUser?.email || 'Utilisateur inconnu'}`;

      doc.text(printDate, 200, 25);
      doc.text(userInfo, 200, 30);

      const tableData = sortedTransferts.map(t => [
        formatDate(t.date),
        t.caisseSource?.libelle || "N/A",
        t.caisseDestination?.libelle || "N/A",
        `${t.montant?.toFixed(3) || "0.000"} DT`,
        t.utilisateur?.name || t.utilisateur?.email || "Utilisateur inconnu",
        t.motif || "-",
        t.statut
      ]);

      autoTable(doc, {
        head: [
          ['Date', 'Caisse Source', 'Caisse Dest.', 'Montant (DT)', 'Utilisateur', 'Description', 'Statut']
        ],
        body: tableData,
        startY: 40, // DÉCALAGE DE LA TABLE POUR LAISSER DE LA PLACE
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          valign: 'middle'
        },
        margin: { left: 15, right: 15 }
      });

      doc.save(`transferts_${now.getTime()}.pdf`);

    } catch (err) {
      setError("❌ Erreur lors de la génération du PDF");
      console.error("Erreur PDF:", err);
    }
  };

  const handleImprimerTout = () => {
    try {
      const printContent = document.getElementById("printable-transferts").innerHTML;
      const printWindow = window.open("", "", "width=900,height=650");

      const now = new Date();
      const printDate = now.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const periodText = `Période: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Toutes dates'}
      à ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Toutes dates'}`;

      const caisseText = `Caisse: ${selectedCaisse ?
        (caisses.find(c => c._id === selectedCaisse)?.libelle || selectedCaisse) :
        'Toutes les caisses'}`;

      const statutText = `Statut: ${selectedStatut ? selectedStatut : 'Tous les statuts'}`;

      printWindow.document.write(`
        <html>
          <head>
            <title>Liste des transferts</title>
            <style>
  @media print {
    /* Style général de la page */
    @page {
      margin: 15mm;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }

    /* En-tête et pied de page */
    .print-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #0056b3;
    }
    .print-header h1 {
      font-size: 24pt;
      font-weight: bold;
      margin: 0;
      color: #0056b3;
    }
    .print-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 10pt;
      color: #555;
    }
    .print-info div {
      margin-bottom: 3px;
    }

    /* Style du tableau */
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ccc;
      margin-top: 20px;
    }
    thead {
      background-color: #007bff;
      color: white;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #ddd;
    }
    th {
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tbody tr:hover {
      background-color: #e9ecef;
    }

    /* Pied de page de l'impression */
    .print-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 9pt;
      color: #777;
      padding: 10px 0;
    }

    /* Colonnes à masquer pour l'impression */
    .no-print {
      display: none !important;
    }
  }
  </style>
          </head>
          <body>
            <div class="print-header">
              <h1>Historique des Transferts</h1>
              <div class="print-info">
                <div>${periodText}</div>
                <div>${caisseText}</div>
                <div>${statutText}</div>
              </div>
            </div>
            ${printContent}
            <div class="print-footer">
              <div>Imprimé le ${printDate} par ${currentUser?.name || currentUser?.email || 'Utilisateur inconnu'}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);

    } catch (err) {
      setError("❌ Erreur lors de l'impression");
      console.error("Erreur impression:", err);
    }
  };

  const getStatusDisplay = (statut) => {
    switch (statut) {
      case 'accepté':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-3 w-3 fill-green-500 text-green-500" />
            Accepté
          </span>
        );
      case 'annulé':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3 w-3 fill-red-500 text-red-500" />
            Annulé
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            <PackageCheck className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="px-6 py-6 bg-white rounded-xl shadow-sm font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Historique des Transferts</h2>
          <p className="text-gray-600">Consultez l'historique complet des transferts entre caisses</p>
        </div>

        {/* Affichage conditionnel des boutons d'exportation */}
        {showExportButtons && (
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleImprimerTout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Imprimer</span>
            </button>
            <button
              onClick={exportToPDF}
              disabled={sortedTransferts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <ArrowDownToLine size={18} />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Affichage du message de validation ou de l'erreur API */}
      {(error || validationMessage) && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error || validationMessage}
        </div>
      )}

      {/* Filtres de recherche */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date début</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date fin</label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Caisse</label>
          <select
            value={selectedCaisse}
            onChange={(e) => setSelectedCaisse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Toutes les caisses</option>
            {caisses.map((c) => (
              <option key={c._id} value={c._id}>{c.libelle}</option>
            ))}
          </select>
        </div>

        {/* NOUVEAU CHAMP DE FILTRE PAR STATUT */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="accepté">Accepté</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>


        <div className="flex-shrink-0">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

      {/* Condition d'affichage pour la table et la pagination */}
      {hasSearched && (
        <>
          {/* Tableau des transferts */}
          <div id="printable-transferts" className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 cursor-pointer select-none">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("date")}
                  >
                    <div className="flex items-center">
                      Date {getSortArrow("date")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("reference")}
                  >
                    <div className="flex items-center">
                      Référence {getSortArrow("reference")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("caisseSource")}
                  >
                    <div className="flex items-center">
                      Caisse Source {getSortArrow("caisseSource")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("caisseDestination")}
                  >
                    <div className="flex items-center">
                      Caisse Dest. {getSortArrow("caisseDestination")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("montant")}
                  >
                    <div className="flex items-center">
                      Montant (DT) {getSortArrow("montant")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300"
                    onClick={() => requestSort("utilisateur")}
                  >
                    <div className="flex items-center">
                      Utilisateur {getSortArrow("utilisateur")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300">
                    Statut
                  </th>
                  <th className="no-print px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-8 w-8 text-purple-600"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : sortedTransferts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={40} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">Aucun transfert trouvé</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Votre recherche n'a pas retourné de résultats.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedTransferts.map((t) => (
                    <tr key={t._id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {t.reference || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {t.caisseSource?.libelle || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {t.caisseDestination?.libelle || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {t.montant?.toFixed(3) || "0.000"} DT
                      </td>
                      <td className="px-4 py-3">
                        {t.utilisateur?.name || t.utilisateur?.email || "Utilisateur inconnu"}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate" title={t.motif}>
                          {t.motif || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusDisplay(t.statut)}
                      </td>
                      <td className="no-print px-4 py-3">
                        <button
                          onClick={() => handleImprimer(t._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                        >
                          <FileCheck size={16} />
                          <span>Reçu</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination et informations */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Lignes par page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">
                {transferts.length > 0
                  ? `Affichage de ${Math.min((currentPage - 1) * pageSize + 1, totalTransferts)} à ${Math.min(currentPage * pageSize, totalTransferts)} sur ${totalTransferts} transferts`
                  : "Aucun transfert"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full border border-gray-300 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} sur {Math.max(totalPages, 1)}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-full border border-gray-300 ${
                  currentPage === totalPages || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Message à afficher avant la première recherche */}
      {!hasSearched && !loading && !error && !validationMessage && (
             <div className="flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Aucun transfert trouvé</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Veuillez utiliser les filtres pour lancer une recherche
                    </p>
                  </div>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}