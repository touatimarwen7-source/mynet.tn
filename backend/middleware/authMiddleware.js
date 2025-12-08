
const AuthorizationGuard = require('../security/AuthorizationGuard');

// Main authentication middleware
const authMiddleware = AuthorizationGuard.authenticateToken.bind(AuthorizationGuard);

// Role-based access control middleware
const roleMiddleware = (allowedRoles) => {
  return AuthorizationGuard.requireRole(allowedRoles);
};

// Permission-based access control middleware
const permissionMiddleware = (requiredPermission) => {
  return AuthorizationGuard.requirePermission(requiredPermission);
};

// Export all middleware functions as named exports
module.exports = {
  authMiddleware,
  verifyToken: authMiddleware,
  roleMiddleware,
  checkRole: roleMiddleware,
  permissionMiddleware,
  checkPermission: permissionMiddleware,
  requireRole: roleMiddleware,
  requirePermission: permissionMiddleware,
};

// Also attach properties to default export for backward compatibility
module.exports.default = authMiddleware;
Object.assign(module.exports.default, module.exports);
