/**
 * 🔐 Rate Limiting Configuration
 * Comprehensive rate limiting strategy:
 * - Global rate limit
 * - Per-user rate limit
 * - Per-IP rate limit
 * - Per-endpoint rate limit
 * - Adaptive rate limiting
 * - DDoS protection
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Create Redis client for rate limiting store
let redisClient;
try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  });
  redisClient.connect().catch(() => {
    console.warn('⚠️  Redis unavailable for rate limiting, using memory store');
    redisClient = null;
  });
} catch (e) {
  console.warn('⚠️  Redis unavailable for rate limiting, using memory store');
}

/**
 * Global rate limiter - 100 requests per 15 minutes
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ping';
  },
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.connection.remoteAddress;
  }
});

/**
 * Per-user rate limiter - 1000 requests per hour
 */
const perUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each user to 1000 requests per hour
  message: 'Too many requests, please try again later.',
  skip: (req) => {
    // Only apply to authenticated users
    return !req.user;
  },
  keyGenerator: (req) => {
    // Use user ID as key
    return req.user?.id || req.ip;
  }
});

/**
 * Authentication endpoints limiter - 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Use email + IP for better tracking
    return `${req.body?.email || 'unknown'}_${req.ip}`;
  }
});

/**
 * API endpoints limiter - 100 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 API requests per minute
  message: 'Too many API requests, please try again later.',
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.connection.remoteAddress;
  }
});

/**
 * Search/Export endpoints limiter - 10 requests per minute
 */
const searchExportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 search/export requests per minute
  message: 'Too many search/export requests, please try again later.',
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});

/**
 * File upload limiter - 5 uploads per 10 minutes
 */
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each user to 5 uploads per 10 minutes
  message: 'Too many file uploads, please try again later.',
  keyGenerator: (req) => {
    // Use user ID as key
    return req.user?.id || req.ip;
  }
});

/**
 * Payment endpoints limiter - 5 attempts per hour
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 payment attempts per hour
  message: 'Too many payment attempts, please try again later.',
  skipFailedRequests: false, // Count failed requests too
  keyGenerator: (req) => {
    // Use user ID as key
    return req.user?.id || req.ip;
  }
});

/**
 * Email/Notification limiter - 10 per hour
 */
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each recipient to 10 emails per hour
  message: 'Too many emails sent, please try again later.',
  keyGenerator: (req) => {
    // Use recipient email as key
    return req.body?.email || req.user?.email || req.ip;
  }
});

/**
 * Adaptive rate limiting based on endpoint sensitivity
 */
const adaptiveRateLimiter = (req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Determine which limiter to apply based on path
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return authLimiter(req, res, next);
  } else if (path.includes('/upload') || path.includes('/file')) {
    return uploadLimiter(req, res, next);
  } else if (path.includes('/payment') || path.includes('/stripe')) {
    return paymentLimiter(req, res, next);
  } else if (path.includes('/search') || path.includes('/export')) {
    return searchExportLimiter(req, res, next);
  } else if (path.includes('/email') || path.includes('/notify')) {
    return emailLimiter(req, res, next);
  } else if (path.includes('/api/')) {
    return apiLimiter(req, res, next);
  } else {
    return globalLimiter(req, res, next);
  }
};

/**
 * Custom rate limit response handler
 */
const rateLimitErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit?.resetTime,
      limit: req.rateLimit?.limit,
      current: req.rateLimit?.current
    });
  }
  next(err);
};

module.exports = {
  globalLimiter,
  perUserLimiter,
  authLimiter,
  apiLimiter,
  searchExportLimiter,
  uploadLimiter,
  paymentLimiter,
  emailLimiter,
  adaptiveRateLimiter,
  rateLimitErrorHandler
};
