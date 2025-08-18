const User = require("../Models/User");

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isValid = await user.comparePassword(oldPassword);
    if (!isValid) return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Mot de passe modifié" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.uploadImage = async (req, res) => {
    
  if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.profileImage = req.file.filename;
    await user.save();
    res.json({ message: "Image téléchargée", filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email profileImage societe role");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};