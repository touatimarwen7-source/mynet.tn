/**
 * 💾 RESPONSE CACHE MANAGER
 * Simple in-memory caching for API responses with TTL
 * Reduces redundant API calls and improves performance
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set cache value with optional TTL (in seconds)
   */
  set(key, value, ttl = 60) {
    // Clear previous timer if exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store value
    this.cache.set(key, value);

    // Set auto-expire timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
    }
  }

  /**
   * Get cache value
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if cache has key
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}

// Default cache manager instance
const globalCache = new CacheManager();

// Cache patterns for API responses
export const cachePatterns = {
  TENDERS: (tenantId) => `tenders_${tenantId}`,
  BIDS: (tenderId) => `bids_${tenderId}`,
  COMPANY: (companyId) => `company_${companyId}`,
  USERS: (tenantId) => `users_${tenantId}`,
  STATISTICS: (tenantId) => `stats_${tenantId}`,
};

/**
 * Cache API response with key and TTL
 */
export const cacheResponse = (key, response, ttl = 300) => {
  globalCache.set(key, response, ttl);
  return response;
};

/**
 * Get cached response or null
 */
export const getCachedResponse = (key) => {
  return globalCache.get(key);
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = (pattern) => {
  globalCache.keys().forEach(key => {
    if (key.includes(pattern)) {
      globalCache.delete(key);
    }
  });
};

/**
 * Invalidate all cache
 */
export const invalidateAllCache = () => {
  globalCache.clear();
};

export default globalCache;
