/**
 * 🚦 PER-USER RATE LIMITING
 * Prevents abuse by limiting requests per user/IP
 * Uses memory-based store (upgrade to Redis for production)
 */

const rateLimit = require('express-rate-limit');

// In-memory store for rate limits (simple, suitable for single server)
class InMemoryRateLimitStore {
  constructor() {
    this.users = new Map();
    this.cleanup();
  }

  increment(key, windowMs) {
    if (!this.users.has(key)) {
      this.users.set(key, { count: 0, resetTime: Date.now() + windowMs });
    }

    const record = this.users.get(key);

    // Reset if window has passed
    if (Date.now() > record.resetTime) {
      record.count = 0;
      record.resetTime = Date.now() + windowMs;
    }

    record.count++;
    return record.count;
  }

  cleanup() {
    // Cleanup old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.users.entries()) {
        if (now > record.resetTime + 60000) { // Remove 1 minute after expiry
          this.users.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

const store = new InMemoryRateLimitStore();

/**
 * Per-user rate limiter
 * 100 requests per 15 minutes per authenticated user
 * Falls back to IP-based for unauthenticated requests
 */
const perUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this user, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      retryAfter: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health checks and public endpoints
    return req.path === '/health' || req.path === '/api/auth/register';
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || `ip_${req.clientIP}`;
  }
});

/**
 * Strict rate limiter for login attempts
 * 5 failed attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      retryAfter: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email + IP combination
    return `${req.body?.email || 'unknown'}_${req.clientIP}`;
  },
  store: new rateLimit.MemoryStore()
});

/**
 * API endpoint rate limiters with custom limits
 */
const apiLimiters = {
  // Export operations - allow 10 per hour
  export: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.id || req.clientIP,
    message: { error: 'Export limit exceeded. Max 10 exports per hour' }
  }),

  // File uploads - allow 20 per hour per user
  upload: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyGenerator: (req) => req.user?.id || req.clientIP,
    message: { error: 'Upload limit exceeded. Max 20 uploads per hour' }
  }),

  // Tender creation - allow 50 per day per user
  tenderCreation: rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 50,
    keyGenerator: (req) => req.user?.id || req.clientIP,
    message: { error: 'Tender creation limit exceeded. Max 50 per day' }
  }),

  // API calls - standard 100 per 15 minutes
  general: perUserLimiter,

  // Search operations - allow 30 per minute to prevent DoS
  search: rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.user?.id || req.clientIP,
    message: { error: 'Search rate limit exceeded' }
  })
};

/**
 * Get user rate limit status
 */
const getRateLimitStatus = (req) => {
  const key = req.user?.id || `ip_${req.clientIP}`;
  const userRecord = store.users.get(key);

  if (!userRecord) {
    return {
      remaining: 100,
      limit: 100,
      resetTime: new Date(Date.now() + 15 * 60 * 1000)
    };
  }

  return {
    used: userRecord.count,
    remaining: Math.max(0, 100 - userRecord.count),
    limit: 100,
    resetTime: new Date(userRecord.resetTime)
  };
};

module.exports = {
  perUserLimiter,
  loginLimiter,
  apiLimiters,
  getRateLimitStatus
};
