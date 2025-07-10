const Journal = require('../models/Journal');

// Créer un journal
exports.createJournal = async (req, res) => {
    try {
        const journal = new Journal(req.body);
        const savedJournal = await journal.save();
        res.status(201).json(savedJournal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les journaux
exports.getAllJournals = async (req, res) => {
    try {
        const journals = await Journal.find();
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un journal par ID
exports.getJournalById = async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal) {
            return res.status(404).json({ message: 'Journal non trouvé' });
        }
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un journal
exports.updateJournal = async (req, res) => {
    try {
        const updatedJournal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedJournal) {
            return res.status(404).json({ message: 'Journal non trouvé' });
        }
        res.status(200).json(updatedJournal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un journal
exports.deleteJournal = async (req, res) => {
    try {
        const deletedJournal = await Journal.findByIdAndDelete(req.params.id);
        if (!deletedJournal) {
            return res.status(404).json({ message: 'Journal non trouvé' });
        }
        res.status(200).json({ message: 'Journal supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
