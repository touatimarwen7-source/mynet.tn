/**
 * 🛡️ CSRF PROTECTION
 * Cross-Site Request Forgery protection
 * 
 * How it works:
 * 1. Backend generates CSRF token and sends to frontend
 * 2. Frontend includes token in X-CSRF-Token header
 * 3. Backend validates token before processing state-changing requests
 */

const crypto = require('crypto');

// Store CSRF tokens (in production, use Redis or session store)
const csrfTokens = new Map();

/**
 * Generate CSRF token
 */
function generateCSRFToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store token with expiry (30 minutes)
  csrfTokens.set(token, {
    sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000
  });

  return token;
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(token, sessionId) {
  if (!token) return false;

  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return false; // Token doesn't exist
  }

  // Check expiry
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }

  // Check session match
  if (tokenData.sessionId !== sessionId) {
    return false;
  }

  return true;
}

/**
 * Middleware to provide CSRF token to frontend
 */
function csrfTokenProvider(req, res, next) {
  // Generate token for session
  const sessionId = req.sessionID || req.user?.id || 'anonymous';
  const token = generateCSRFToken(sessionId);

  // Add to response headers and body
  res.set('X-CSRF-Token', token);
  res.locals.csrfToken = token;

  next();
}

/**
 * Middleware to validate CSRF token on state-changing requests
 */
function csrfProtection(req, res, next) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for public endpoints
  const publicEndpoints = ['/api/auth/login', '/api/auth/register'];
  if (publicEndpoints.some(endpoint => req.path === endpoint)) {
    return next();
  }

  // Get token from header
  const token = req.get('X-CSRF-Token');
  const sessionId = req.sessionID || req.user?.id || 'anonymous';

  // Validate
  if (!validateCSRFToken(token, sessionId)) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or missing CSRF token',
        code: 'CSRF_TOKEN_INVALID',
        statusCode: 403
      }
    });
  }

  // Token valid, invalidate it (one-time use)
  csrfTokens.delete(token);

  next();
}

/**
 * Clean up expired tokens (run periodically)
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(token);
    }
  }
}

// Clean up every 10 minutes
setInterval(cleanupExpiredTokens, 10 * 60 * 1000);

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  csrfTokenProvider,
  csrfProtection,
  cleanupExpiredTokens
};
