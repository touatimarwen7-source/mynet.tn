/**
 * 🚀 Enhanced Rate Limiting Middleware
 *
 * Features:
 * - IP-based rate limiting (automatic, no custom generator)
 * - Per-user rate limiting (for authenticated requests)
 * - Sliding window algorithm
 * - Different limits for different endpoints
 * - Rate limit headers
 * - Metrics tracking
 */

const rateLimit = require('express-rate-limit');

// Store for tracking
const userLimits = new Map();

/**
 * Rate limiting configurations
 */

// General API endpoint limits (IP-based)
const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict login limits (IP-based)
const login = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration limits (IP-based)
const register = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset limits (IP-based)
const passwordReset = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoint limits (per-user or IP)
const apiEndpoint = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many requests to this API endpoint, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Tender creation limits (per-user only)
const tenderCreation = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many tender creations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user, // Don't rate limit unauthenticated
  keyGenerator: (req) => {
    return req.user && req.user.id ? `user:${req.user.id}` : 'anonymous';
  },
});

// Offer submission limits (per-user only)
const offerSubmission = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many offers submitted, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user,
  keyGenerator: (req) => {
    return req.user && req.user.id ? `user:${req.user.id}` : 'anonymous';
  },
});

// Message sending limits (per-user only)
const messageSending = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many messages sent, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user,
  keyGenerator: (req) => {
    return req.user && req.user.id ? `user:${req.user.id}` : 'anonymous';
  },
});

// Search limits
const search = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Export limits
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many export requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Enhanced Rate Limiting Middleware
 * Provides comprehensive rate limiting with user and IP tracking
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// Store for tracking rate limits
const rateLimitStore = new Map();

/**
 * Custom rate limiting middleware with advanced tracking
 */
function advancedRateLimitMiddleware(req, res, next) {
  try {
    // Track for metrics
    const key = req.user ? `user:${req.user.id}` : req.ip || 'unknown';

    if (!userLimits.has(key)) {
      userLimits.set(key, {
        requests: 0,
        firstRequest: Date.now(),
        blocked: 0,
      });
    }

    const stats = userLimits.get(key);
    stats.requests++;

    // Add custom headers
    res.setHeader('X-RateLimit-Key', key);
    res.setHeader('X-RateLimit-Timestamp', new Date().toISOString());

    next();
  } catch (error) {
    // Log error but don't block request
    console.error('Rate limit tracking error:', error);
    next();
  }
}

/**
 * Get rate limit statistics
 */
function getRateLimitStats() {
  const stats = {
    totalTrackedKeys: userLimits.size,
    trackedUsers: Array.from(userLimits.entries())
      .filter(([key]) => key.startsWith('user:'))
      .map(([key, data]) => ({
        userId: key.replace('user:', ''),
        requests: data.requests,
        blocked: data.blocked,
        timeWindow: new Date(data.firstRequest).toISOString(),
      })),
    recentActivity: Array.from(userLimits.entries())
      .slice(-10)
      .map(([key, data]) => ({
        key,
        requests: data.requests,
        blocked: data.blocked,
      })),
  };
  return stats;
}

/**
 * Reset limits for a specific key/user
 */
function resetLimits(key) {
  if (userLimits.has(key)) {
    userLimits.delete(key);
    return true;
  }
  return false;
}

/**
 * Clear all limits
 */
function clearAllLimits() {
  userLimits.clear();
}

module.exports = {
  // Limiters
  general,
  login,
  register,
  passwordReset,
  apiEndpoint,
  tenderCreation,
  offerSubmission,
  messageSending,
  search,
  export: exportLimiter,

  // Middleware
  advancedRateLimitMiddleware,

  // Utilities
  getRateLimitStats,
  resetLimits,
  clearAllLimits,
};



/**
 * Advanced rate limit middleware with user/IP tracking
 */
const advancedRateLimitMiddleware = (req, res, next) => {
  const identifier = req.user?.id || req.clientIP || req.ip || 'unknown';
  const key = `ratelimit:${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 0,
      firstRequest: Date.now(),
      lastRequest: Date.now()
    });
  }
  
  const data = rateLimitStore.get(key);
  data.count++;
  data.lastRequest = Date.now();
  
  // Log high-frequency requests
  if (data.count > 50) {
    logger.warn('High request frequency detected', {
      identifier,
      count: data.count,
      duration: data.lastRequest - data.firstRequest
    });
  }
  
  next();
};

/**
 * Get rate limit statistics
 */
const getRateLimitStats = () => {
  const stats = {
    totalTracked: rateLimitStore.size,
    highFrequency: 0,
    entries: []
  };
  
  rateLimitStore.forEach((data, key) => {
    if (data.count > 50) stats.highFrequency++;
    stats.entries.push({ key, ...data });
  });
  
  return stats;
};

/**
 * Reset limits for a specific key
 */
const resetLimits = (key) => {
  return rateLimitStore.delete(key);
};

/**
 * Clear all limits
 */
const clearAllLimits = () => {
  rateLimitStore.clear();
};

// Export all rate limiters and utilities
module.exports = {
  general,
  auth,
  upload,
  payment,
  search,
  exportLimiter,
  advancedRateLimitMiddleware,
  getRateLimitStats,
  resetLimits,
  clearAllLimits
};
