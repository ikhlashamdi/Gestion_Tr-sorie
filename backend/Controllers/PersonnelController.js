const Personnel = require('../Models/Personnel');

exports.createPersonnel = async (req, res) => {
    try {
        const personnel = new Personnel(req.body);
        const saved = await personnel.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPersonnels = async (req, res) => {
    try {
        const items = await Personnel.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPersonnelById = async (req, res) => {
    try {
        const item = await Personnel.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Personnel non trouvé' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePersonnel = async (req, res) => {
    try {
        const updated = await Personnel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Personnel non trouvé' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePersonnel = async (req, res) => {
    try {
        const deleted = await Personnel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Personnel non trouvé' });
        res.status(200).json({ message: 'Personnel supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
