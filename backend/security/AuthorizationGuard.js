const KeyManagementService = require('./KeyManagementService');
const { hasPermission } = require('../config/Roles');

class AuthorizationGuard {
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Accès refusé. Aucun jeton fourni.' 
            });
        }

        try {
            const decoded = KeyManagementService.verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ 
                error: 'Jeton invalide ou expiré.' 
            });
        }
    }

    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentification requise.' 
                });
            }

            if (!hasPermission(req.user.role, permission)) {
                return res.status(403).json({ 
                    error: 'Vous n'''avez pas la permission d'''effectuer cette action.' 
                });
            }

            next();
        };
    }

    requireRole(allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentification requise.' 
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: 'Vous n'''avez pas accès à cette ressource.' 
                });
            }

            next();
        };
    }
}

module.exports = new AuthorizationGuard();
