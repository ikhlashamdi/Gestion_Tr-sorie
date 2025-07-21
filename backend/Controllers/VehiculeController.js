const Vehicule = require('../Models/Vehicule');

exports.createVehicule = async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        const saved = await vehicule.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllVehicules = async (req, res) => {
    try {
        const items = await Vehicule.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehiculeById = async (req, res) => {
    try {
        const item = await Vehicule.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Véhicule non trouvé' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVehicule = async (req, res) => {
    try {
        const updated = await Vehicule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Véhicule non trouvé' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVehicule = async (req, res) => {
    try {
        const deleted = await Vehicule.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Véhicule non trouvé' });
        res.status(200).json({ message: 'Véhicule supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
