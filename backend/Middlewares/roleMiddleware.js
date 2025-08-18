const checkRole = (roles) => (req, res, next) => {
  // 1. Vérifie si l'utilisateur est authentifié et si son rôle est défini
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  // 2. Vérifie si le rôle de l'utilisateur est inclus dans les rôles autorisés
  if (roles.includes(req.user.role)) {
    next(); // L'utilisateur a l'autorisation, on passe à la prochaine fonction
  } else {
    // L'utilisateur n'a pas le bon rôle, on refuse l'accès
    res.status(403).json({ message: "Accès refusé. Rôle insuffisant." });
  }
};

module.exports = checkRole;