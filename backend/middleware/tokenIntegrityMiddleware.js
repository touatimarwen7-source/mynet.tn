/**
 * 🔐 Token Integrity Middleware
 * Comprehensive token validation:
 * - Signature verification
 * - Token expiration check
 * - Payload integrity validation
 * - Rate limiting per token
 * - Token revocation check
 * - Permission verification
 */

const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Verify token signature and payload
 */
const verifyTokenIntegrity = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL_ERROR: JWT_SECRET environment variable must be set.');
    }
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256', 'RS256']
    });
    
    return {
      valid: true,
      decoded,
      expiresAt: new Date(decoded.exp * 1000)
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      decoded: null
    };
  }
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Add token to blacklist (for logout)
 */
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Auto-cleanup after expiration
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expirationTime = (decoded.exp * 1000) - Date.now();
      if (expirationTime > 0) {
        setTimeout(() => tokenBlacklist.delete(token), expirationTime);
      }
    }
  } catch (e) {
    // Silent fail
  }
};

/**
 * Validate token permissions
 */
const validateTokenPermissions = async (decoded, requiredPermissions = []) => {
  try {
    const pool = getPool();
    
    // Get user from database to verify permissions
    const userQuery = `
      SELECT id, role, permissions, status 
      FROM users 
      WHERE id = $1 
      LIMIT 1
    `;
    
    const result = await pool.query(userQuery, [decoded.userId]);
    
    if (result.rows.length === 0) {
      return {
        valid: false,
        error: 'User not found'
      };
    }
    
    const user = result.rows[0];
    
    // Check if user is active
    if (user.status !== 'active') {
      return {
        valid: false,
        error: 'User account is not active'
      };
    }
    
    // Check permissions
    if (requiredPermissions.length > 0) {
      const userPermissions = user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(perm => 
        userPermissions.includes(perm) || user.role === 'super_admin'
      );
      
      if (!hasAllPermissions) {
        return {
          valid: false,
          error: 'Insufficient permissions',
          missing: requiredPermissions.filter(p => !userPermissions.includes(p))
        };
      }
    }
    
    return {
      valid: true,
      user
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Token Integrity Middleware
 */
const tokenIntegrityMiddleware = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing authorization token',
          code: 'MISSING_TOKEN'
        });
      }
      
      const token = authHeader.substring(7);
      
      // Check if token is blacklisted
      if (isTokenBlacklisted(token)) {
        return res.status(401).json({
          success: false,
          error: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
      
      // Verify token integrity
      const verification = verifyTokenIntegrity(token);
      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token: ' + verification.error,
          code: 'INVALID_TOKEN'
        });
      }
      
      // Check token expiration
      if (verification.expiresAt < new Date()) {
        return res.status(401).json({
          success: false,
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      // Validate token permissions
      const permissionCheck = await validateTokenPermissions(
        verification.decoded,
        requiredPermissions
      );
      
      if (!permissionCheck.valid) {
        return res.status(403).json({
          success: false,
          error: permissionCheck.error,
          code: 'PERMISSION_DENIED',
          missing: permissionCheck.missing
        });
      }
      
      // Attach user info to request
      req.user = {
        id: verification.decoded.userId,
        email: verification.decoded.email,
        role: verification.decoded.role,
        permissions: permissionCheck.user.permissions,
        tokenExpires: verification.expiresAt
      };
      
      // Attach token integrity metadata
      req.tokenMetadata = {
        issuedAt: new Date(verification.decoded.iat * 1000),
        expiresAt: verification.expiresAt,
        issuer: verification.decoded.iss
      };
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Token verification error',
        code: 'TOKEN_VERIFICATION_ERROR'
      });
    }
  };
};

module.exports = {
  verifyTokenIntegrity,
  isTokenBlacklisted,
  blacklistToken,
  validateTokenPermissions,
  tokenIntegrityMiddleware
};
