const express = require("express");
const router = express.Router();
const MvtCaisse = require("../Models/MvtCaisse");
const Caisse = require("../Models/Caisse");
const PDFDocument = require("pdfkit"); 
const ExcelJS = require("exceljs");    

// /api/rapports/journal-caisse?caisseId=XXX&format=pdf
router.get("/journal-caisse", async (req, res) => {
  const { caisseId, format } = req.query;

  if (!caisseId || !format) {
    return res.status(400).send("Paramètres manquants");
  }

  try {
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) return res.status(404).send("Caisse introuvable");

    let mouvements = await MvtCaisse.find({ caisse: caisseId })
  .populate("natureCharge")
.populate({ path: "tier", refPath: "tierModel" })
  .sort({ date: 1 });


    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="journal-${caisse.code}.pdf"`);
      doc.pipe(res);

      doc.fontSize(16).text(`Journal de caisse : ${caisse.libelle}`, { underline: true });
      doc.moveDown();

      mouvements.forEach((mvt) => {
      doc
        .fontSize(12)
        .text(
            `${mvt.date.toISOString().split("T")[0]} - ${mvt.typeMouvement.toUpperCase()} - ${mvt.montant} DT - ${mvt.description || ""} - Tiers: ${
            ["Client", "Fournisseur"].includes(mvt.tierModel)
                ? mvt.tier?.rsoc || ""
                : mvt.tier?.libelle || ""
            } - Nature: ${mvt.natureCharge?.libelle || ""}`
        );

      });

      doc.end();
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Journal Caisse");

      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Type", key: "type", width: 15 },
        { header: "Montant", key: "montant", width: 15 },
        { header: "Communication", key: "description", width: 30 },
        { header: "Tiers", key: "tier", width: 25 },
        { header: "Nature", key: "nature", width: 25 },
      ];

      mouvements.forEach((mvt) => {
        sheet.addRow({
        date: mvt.date.toISOString().split("T")[0],
        type: mvt.typeMouvement,
        montant: mvt.montant,
        description: mvt.description,
        tier: ["Client", "Fournisseur"].includes(mvt.tierModel)
            ? mvt.tier?.rsoc || ""
            : mvt.tier?.libelle || "",
        nature: mvt.natureCharge?.libelle || "",
        });

      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="journal-${caisse.code}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).send("Format non pris en charge");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
