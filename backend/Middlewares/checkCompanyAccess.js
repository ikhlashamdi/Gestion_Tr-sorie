const checkCompanyAccess = (req, res, next) => {
    // Le super-admin a un accès illimité, il n'a pas besoin de cette vérification.
    if (req.user.role === 'super-admin') {
        return next();
    }

    // On récupère l'ID de la société ciblée depuis les paramètres de la requête ou le corps.
    const targetCompanyId = req.params.companyId || req.body.societe || req.query.societe;
    
    // Si l'ID de la société est manquant dans la requête, c'est une erreur.
    if (!targetCompanyId) {
        return res.status(400).json({ message: "ID de société manquant." });
    }

    // On compare l'ID de la société de l'utilisateur (depuis le token)
    // avec l'ID de la société ciblée.
    if (req.user.societe.toString() !== targetCompanyId.toString()) {
        return res.status(403).json({ message: "Accès refusé. Vous n'avez pas l'autorisation pour cette société." });
    }

    next();
};