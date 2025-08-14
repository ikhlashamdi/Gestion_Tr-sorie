import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Printer, Search, Calendar, ChevronLeft, ChevronRight, CheckCircle, PackageCheck, FileCheck, ArrowBigDown, ArrowDown, ArrowDownFromLine, ArrowDownToLine } from "lucide-react";
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

  // État de l'utilisateur et de la pagination
  const [currentUser, setCurrentUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTransferts, setTotalTransferts] = useState(0);

  // NOUVEL ÉTAT POUR LA VISIBILITÉ DES BOUTONS
  const [showExportButtons, setShowExportButtons] = useState(false);

  // Fonction pour charger les transferts depuis l'API
  const fetchTransferts = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    // Masquer les boutons au début d'une nouvelle recherche
    setShowExportButtons(false); 
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const params = {
        page,
        pageSize: size,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCaisse) params.caisse = selectedCaisse;

      const res = await axios.get("http://localhost:5000/api/transferts", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const transfertsData = Array.isArray(res.data)
        ? res.data
        : res.data.transferts || [];
      
      const totalData = Array.isArray(res.data)
        ? res.data.length
        : res.data.total || 0;

      setTransferts(transfertsData);
      setTotalTransferts(totalData);
      setError("");

      // Afficher les boutons si la recherche est un succès et qu'il y a des données
      if (transfertsData.length > 0) {
        setShowExportButtons(true);
      }
    } catch (err) {
      setError("❌ Erreur lors du chargement des transferts.");
      setTransferts([]);
      setShowExportButtons(false); // S'assurer que les boutons sont masqués en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche améliorée
  const handleSearch = () => {
    // Réinitialiser la pagination à la première page et lancer la recherche
    setCurrentPage(1);
    fetchTransferts(1, pageSize);
  };

  // Chargement initial des données (caisses, utilisateur) au montage du composant
  useEffect(() => {
    const fetchInitialData = async () => {
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

  // Déclencher le fetch des transferts
  useEffect(() => {
    if (currentUser && showExportButtons) { // Seulement re-fetch si les boutons sont déjà visibles
        fetchTransferts();
    }
  }, [currentPage, pageSize]);

  // Fonction de tri
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Flèche de tri
  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronLeft size={14} className="inline ml-1 transform rotate-90" /> : <ChevronRight size={14} className="inline ml-1 transform rotate-90" />;
  };

  // Tri des données en mémoire
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

  // Imprimer le PDF d'un transfert individuel
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

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(totalTransferts / pageSize);

  // Formatage de la date
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

  // Fonction pour exporter au format PDF avec mise en page professionnelle
  const exportToPDF = () => {
    try {
      // Créer un nouveau document PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Titre principal
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORIQUE DES TRANSFERTS", 105, 15, null, null, 'center');
      
      // Informations sur la période et la caisse
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const periodText = `Période: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Toutes dates'} 
      à ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Toutes dates'}`;
      const caisseText = `Caisse: ${selectedCaisse ? 
      (caisses.find(c => c._id === selectedCaisse)?.libelle || selectedCaisse) : 
      'Toutes les caisses'}`;
      
      doc.text(periodText, 15, 25);
      doc.text(caisseText, 15, 30);
      
      // Date d'impression et utilisateur
      const now = new Date();
      const printDate = `Imprimé le: ${now.toLocaleDateString('fr-FR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit'
      })}`;
      
      const userInfo = `Par: ${currentUser?.name || currentUser?.email || 'Utilisateur inconnu'}`;
      
      doc.text(printDate, 200, 25);
      doc.text(userInfo, 200, 30);
      
      // Préparer les données du tableau
      const tableData = sortedTransferts.map(t => [
        formatDate(t.date),
        t.caisseSource?.libelle || "N/A",
        t.caisseDestination?.libelle || "N/A",
        `${t.montant?.toFixed(3) || "0.000"} DT`,
        t.utilisateur?.name || t.utilisateur?.email || "Utilisateur inconnu",
        t.motif || "-"
      ]);
      
      // Créer le tableau
      autoTable(doc, {
        head: [
          ['Date', 'Caisse Source', 'Caisse Dest.', 'Montant (DT)', 'Utilisateur', 'Description']
        ],
        body: tableData,
        startY: 35,
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
      
      // Enregistrer le PDF
      doc.save(`transferts_${now.getTime()}.pdf`);
      
    } catch (err) {
      setError("❌ Erreur lors de la génération du PDF");
      console.error("Erreur PDF:", err);
    }
  };

  // Impression améliorée de la page courante
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
      font-family: 'Helvetica Neue', Arial, sans-serif; /* Utilisation d'une police moderne */
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }

    /* En-tête et pied de page */
    .print-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #0056b3; /* Ligne de séparation bleue plus nette */
    }
    .print-header h1 {
      font-size: 24pt;
      font-weight: bold;
      margin: 0;
      color: #0056b3; /* Couleur de titre en harmonie avec la ligne */
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
      border: 1px solid #ccc; /* Bordure générale pour le tableau */
      margin-top: 20px;
    }
    thead {
      background-color: #007bff; /* En-tête de tableau bleu vibrant */
      color: white;
    }
    th, td {
      padding: 10px 12px; /* Espacement intérieur */
      text-align: left;
      border: 1px solid #ddd;
    }
    th {
      font-weight: bold;
      text-transform: uppercase; /* Texte en majuscule pour l'en-tête */
      letter-spacing: 0.5px;
    }
    tbody tr:nth-child(even) {
      background-color: #f8f9fa; /* Lignes alternées pour une meilleure lisibilité */
    }
    tbody tr:hover {
      background-color: #e9ecef; /* Effet de survol (bien que non visible à l'impression, c'est une bonne pratique) */
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
      
      // Add a small delay to allow the content to render
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250); // A delay of 250ms is usually sufficient

    } catch (err) {
      setError("❌ Erreur lors de l'impression");
      console.error("Erreur impression:", err);
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

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
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
        
        <div className="flex-shrink-0">
          <button
            onClick={handleSearch} // Appeler la nouvelle fonction de recherche
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

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
              <th className="no-print px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center">
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
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={40} className="text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Aucun transfert trouvé</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Veuillez utiliser les filtres pour lancer une recherche
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