const checkSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super-admin') {
        next(); 
    } else {
        res.status(403).json({ message: "Accès refusé. Droits de Super Administrateur requis." });
    }
};

module.exports = checkSuperAdmin;