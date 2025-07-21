const NatureCharge = require('../Models/NatureCharge');

exports.createNatureCharge = async (req, res) => {
    try {
        const natureCharge = new NatureCharge(req.body);
        const saved = await natureCharge.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllNatureCharges = async (req, res) => {
    try {
        const items = await NatureCharge.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNatureChargeById = async (req, res) => {
    try {
        const item = await NatureCharge.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Nature de charge non trouvée' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateNatureCharge = async (req, res) => {
    try {
        const updated = await NatureCharge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Nature de charge non trouvée' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteNatureCharge = async (req, res) => {
    try {
        const deleted = await NatureCharge.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Nature de charge non trouvée' });
        res.status(200).json({ message: 'Nature de charge supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
