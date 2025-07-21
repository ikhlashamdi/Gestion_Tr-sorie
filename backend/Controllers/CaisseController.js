const Caisse = require('../Models/Caisse');

exports.createCaisse = async (req, res) => {
    try {
        const caisse = new Caisse(req.body);
        const savedCaisse = await caisse.save();
        res.status(201).json(savedCaisse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCaisses = async (req, res) => {
    try {
        const caisses = await Caisse.find();
        res.status(200).json(caisses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCaisseById = async (req, res) => {
    try {
        const caisse = await Caisse.findById(req.params.id);
        if (!caisse) return res.status(404).json({ message: 'Caisse non trouvée' });
        res.status(200).json(caisse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCaisse = async (req, res) => {
    try {
        const updatedCaisse = await Caisse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedCaisse) return res.status(404).json({ message: 'Caisse non trouvée' });
        res.status(200).json(updatedCaisse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCaisse = async (req, res) => {
    try {
        const deletedCaisse = await Caisse.findByIdAndDelete(req.params.id);
        if (!deletedCaisse) return res.status(404).json({ message: 'Caisse non trouvée' });
        res.status(200).json({ message: 'Caisse supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
