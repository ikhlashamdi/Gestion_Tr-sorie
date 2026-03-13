const checkCompanyAccess = (req, res, next) => {
    if (req.user.role === 'super-admin') {
        return next();
    }

    const targetCompanyId = req.params.companyId || req.body.societe || req.query.societe;
    
    if (!targetCompanyId) {
        return res.status(400).json({ message: "ID de société manquant." });
    }


    if (req.user.societe.toString() !== targetCompanyId.toString()) {
        return res.status(403).json({ message: "Accès refusé. Vous n'avez pas l'autorisation pour cette société." });
    }

    next();
};