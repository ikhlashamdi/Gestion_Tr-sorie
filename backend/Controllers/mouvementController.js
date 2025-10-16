

const MvtCaisse = require('../Models/MvtCaisse'); 
const mongoose = require('mongoose');

exports.getDailySummary = async (req, res) => {
    try {
        const { caisseId } = req.params;
        const days = parseInt(req.query.days) || 7; 
        
        const caisseObjectId = new mongoose.Types.ObjectId(caisseId);
        
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const aggregationResult = await MvtCaisse.aggregate([
            {
                $match: {
                    caisse: caisseObjectId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$date" },
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    encaissements: {
                        $sum: {
                            $cond: [{ $eq: ["$typeMouvement", "encaissement"] }, "$montant", 0]
                        }
                    },
                    decaissements: {
                        $sum: {
                            $cond: [{ $eq: ["$typeMouvement", "decaissement"] }, "$montant", 0]
                        }
                    }
                }
            },
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

        const dailyData = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().substring(0, 10);
            dailyData[dateStr] = { date: dateStr, encaissements: 0, decaissements: 0 };
        }

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