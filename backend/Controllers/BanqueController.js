const Banque = require('../Models/Banque');

exports.createBanque = async (req, res) => {
    try {
        const banque = new Banque(req.body);
        const saved = await banque.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBanques = async (req, res) => {
    try {
        const banques = await Banque.find();
        res.status(200).json(banques);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBanqueById = async (req, res) => {
    try {
        const banque = await Banque.findById(req.params.id);
        if (!banque) return res.status(404).json({ message: 'Banque non trouvée' });
        res.status(200).json(banque);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBanque = async (req, res) => {
    try {
        const updated = await Banque.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Banque non trouvée' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBanque = async (req, res) => {
    try {
        const deleted = await Banque.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Banque non trouvée' });
        res.status(200).json({ message: 'Banque supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
