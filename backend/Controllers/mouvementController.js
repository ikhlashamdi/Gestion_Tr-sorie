// controllers/mouvementController.js

const MvtCaisse = require('../Models/MvtCaisse'); // Assurez-vous d'importer votre modèle
const mongoose = require('mongoose');

exports.getDailySummary = async (req, res) => {
    try {
        const { caisseId } = req.params;
        const days = parseInt(req.query.days) || 7; 
        
        const caisseObjectId = new mongoose.Types.ObjectId(caisseId);
        
        // Calcul de la date de début
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        // 1. Pipeline d'Agrégation OPTIMISÉ (Réduit de 3 à 2 étapes d'agrégation)
        const aggregationResult = await MvtCaisse.aggregate([
            {
                $match: {
                    caisse: caisseObjectId,
                    // ⚠️ VÉRIFIEZ ABSOLUMENT QUE VOTRE STATUT EST BIEN EN MINUSCULES
                    //etat: 'valide', // Assurez-vous que la valeur est 'valide' et non 'valide' (avec accent) ou 'valider'
                    date: { $gte: startDate }
                }
            },
            // Regrouper par date et consolider les encaissements/décaissements en une seule étape
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$date" },
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    encaissements: {
                        $sum: {
                            // Sépare et somme en utilisant le typeMouvement
                            $cond: [{ $eq: ["$typeMouvement", "encaissement"] }, "$montant", 0]
                        }
                    },
                    decaissements: {
                        $sum: {
                            // Sépare et somme en utilisant le typeMouvement
                            $cond: [{ $eq: ["$typeMouvement", "decaissement"] }, "$montant", 0]
                        }
                    }
                }
            },
            // Projeter et Trier (comme précédemment)
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    },
                    encaissements: 1,
                    decaissements: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // 2. Remplir les jours manquants avec des zéros (Logique inchangée, elle est correcte)
        const dailyData = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().substring(0, 10);
            dailyData[dateStr] = { date: dateStr, encaissements: 0, decaissements: 0 };
        }

        // Fusionner les résultats de l'agrégation
        aggregationResult.forEach(item => {
            if (dailyData[item.date]) {
                dailyData[item.date] = item;
            }
        });

        const finalSummary = Object.values(dailyData);
        res.json(finalSummary);

    } catch (error) {
        console.error("Erreur lors du résumé journalier:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du résumé quotidien." });
    }
};