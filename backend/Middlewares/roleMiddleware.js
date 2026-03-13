const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Non autorisé" });
  }


  if (roles.includes(req.user.role)) {
    next();
  } else {

    res.status(403).json({ message: "Accès refusé. Rôle insuffisant." });
  }
};

module.exports = checkRole;