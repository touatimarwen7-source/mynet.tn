const KeyManagementService = require('./KeyManagementService');
const { hasPermission } = require('../config/Roles');

class AuthorizationGuard {
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        try {
            const decoded = KeyManagementService.verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ 
                error: 'Invalid or expired token.' 
            });
        }
    }

    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentication required.' 
                });
            }

            if (!hasPermission(req.user.role, permission)) {
                return res.status(403).json({ 
                    error: 'You do not have permission to perform this action.' 
                });
            }

            next();
        };
    }

    requireRole(allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentication required.' 
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: 'You do not have access to this resource.' 
                });
            }

            next();
        };
    }
}

module.exports = new AuthorizationGuard();
