const Tier = require('../Models/Tier');

exports.createTier = async (req, res) => {
    try {
        const tier = new Tier(req.body);
        const saved = await tier.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTiers = async (req, res) => {
    try {
        const items = await Tier.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTierById = async (req, res) => {
    try {
        const item = await Tier.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Tier non trouvé' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTier = async (req, res) => {
    try {
        const updated = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Tier non trouvé' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTier = async (req, res) => {
    try {
        const deleted = await Tier.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Tier non trouvé' });
        res.status(200).json({ message: 'Tier supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
