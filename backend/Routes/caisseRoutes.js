const express = require('express');
const Caisse = require('../Models/Caisse');
const router = express.Router();
const MvtCaisse = require("../Models/MvtCaisse");


router.get('/', async (req, res) => {
  try {
    const search = req.query.search?.trim() || '';
    console.log("🔍 Recherche reçue :", search);

    let query = {};

    if (search) {
      const isNumber = !isNaN(search);
      query = {
        $or: [
          { libelle: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          ...(isNumber
            ? [
                { soldeInitial: Number(search) },
                { seuilMax: Number(search) }
              ]
            : [])
        ]
      };
    }

const caisses = await Caisse.find(query)
  .populate("utilisateur", "name societe")
  .select("-__v");
  res.status(200).send(caisses);
  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).send({ error: 'Erreur lors de la récupération', details: err });
  }
});


// Créer une caisse
router.post('/', async (req, res) => {
  try {
    const { libelle, soldeInitial, seuilMax = 0, utilisateur, societe } = req.body;

    if (!libelle || soldeInitial == null || !utilisateur || !societe) {
      return res.status(400).send({ error: "Champs requis manquants" });
    }

    const caisses = await Caisse.find();
    let code = "CA01";

    if (caisses.length > 0) {
      const max = Math.max(...caisses.map(c => parseInt(c.code.replace("CA", ""), 10)));
      code = "CA" + String(max + 1).padStart(2, "0");
    }

    const newCaisse = new Caisse({
      code,
      libelle,
      soldeInitial,
      seuilMax,
      soldeActuel: soldeInitial,
      utilisateur,
      societe,
      dateCreation: new Date()
    });

    await newCaisse.save();
    res.status(201).send(newCaisse);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Erreur création caisse", details: err });
  }
});

///
router.patch('/:id/activer', async (req, res) => {
  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });

    caisse.active = !caisse.active;
    await caisse.save();

    res.status(200).send({ message: `Caisse ${caisse.active ? 'activée' : 'désactivée'}`, caisse });
  } catch (err) {
    res.status(500).send({ error: 'Erreur', details: err });
  }
});

// PATCH /api/caisses/:id/etat
router.patch('/:id/etat', async (req, res) => {
  const { etat } = req.body;

  if (!["brouillon", "confirme", "annule"].includes(etat)) {
    return res.status(400).json({ message: "État non valide" });
  }

  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) return res.status(404).json({ message: "Caisse non trouvée" });

    caisse.etat = etat;
    await caisse.save();

    res.json({ message: `État mis à jour`, caisse });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});



// Obtenir une caisse par ID
router.get('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id).select('-__v');
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send(caisse);
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});

// Mettre à jour une caisse
router.put('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v');
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send(caisse);
    } catch (err) {
        res.status(400).send({ error: 'Erreur lors de la mise à jour', details: err });
    }
});

// Supprimer une caisse
router.delete('/:id', async (req, res) => {
    try {
        const caisse = await Caisse.findByIdAndDelete(req.params.id);
        if (!caisse) return res.status(404).send({ error: 'Caisse non trouvée' });
        res.status(200).send({ message: 'Caisse supprimée avec succès' });
    } catch (err) {
        res.status(500).send({ error: 'Erreur', details: err });
    }
});


router.get("/:id/solde", async (req, res) => {
  try {
    const caisseId = req.params.id;
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) return res.status(404).json({ message: "Caisse non trouvée" });

    const mouvements = await MvtCaisse.find({ caisse: caisseId, etat: "valide" });

    const totalMouvements = mouvements.reduce((total, mvt) => {
      const montant = mvt.montant || 0;
      return mvt.typeMouvement === "encaissement"
        ? total + montant
        : total - montant;
    }, 0);

    const soldeCalcule = caisse.soldeInitial + totalMouvements;

    res.json({
      soldeInitial: caisse.soldeInitial,
      soldeCalcule: parseFloat(soldeCalcule.toFixed(2)),
      totalMouvements: parseFloat(totalMouvements.toFixed(2)),
    });
  } catch (err) {
    console.error("❌ Erreur calcul solde caisse :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;


