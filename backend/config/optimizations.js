/**
 * ⚙️ OPTIMIZATION CONFIGURATION
 * Centralized configuration for all performance optimizations
 */

module.exports = {
  // Cache configuration
  cache: {
    default: 300, // 5 minutes
    analytics: 600, // 10 minutes
    profile: 1800, // 30 minutes
    maxSize: 10000 // max items in cache
  },

  // Query optimization
  query: {
    slowQueryThreshold: 1000, // 1 second
    maxConnections: process.env.NODE_ENV === 'production' ? 20 : 10,
    minConnections: process.env.NODE_ENV === 'production' ? 5 : 2,
    poolIdleTimeout: process.env.NODE_ENV === 'production' ? 30000 : 60000
  },

  // Batch operations
  batch: {
    auditLogSize: 10,
    auditFlushInterval: 5000
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    loginMax: 5 // login attempts
  },

  // Timeouts
  timeout: {
    query: 30000, // 30 seconds
    request: 60000 // 60 seconds
  },

  // Pagination
  pagination: {
    maxLimit: 100,
    defaultLimit: 10
  },

  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metricsInterval: 60000, // 1 minute
    logSlowQueries: true,
    slowQueryThreshold: 1000
  }
};
