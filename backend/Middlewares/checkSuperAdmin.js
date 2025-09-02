// Assumons que req.user est défini par le middleware `verifyToken`
const checkSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super-admin') {
        next(); // L'utilisateur est un super-admin, on continue
    } else {
        res.status(403).json({ message: "Accès refusé. Droits de Super Administrateur requis." });
    }
};

module.exports = checkSuperAdmin;