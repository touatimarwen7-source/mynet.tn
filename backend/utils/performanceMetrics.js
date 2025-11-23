/**
 * 📊 PERFORMANCE METRICS
 * Collects and aggregates performance metrics
 */

class PerformanceMetrics {
  constructor() {
    this.metrics = {
      queries: [],
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      requests: 0,
      totalTime: 0
    };
  }

  /**
   * Record query execution
   */
  recordQuery(endpoint, duration, queryCount = 1) {
    this.metrics.queries.push({
      endpoint,
      duration,
      queryCount,
      timestamp: new Date()
    });

    if (this.metrics.queries.length > 1000) {
      this.metrics.queries.shift();
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  /**
   * Record error
   */
  recordError() {
    this.metrics.errors++;
  }

  /**
   * Record request
   */
  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.totalTime += duration;
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheRate = cacheTotal > 0 ? ((this.metrics.cacheHits / cacheTotal) * 100).toFixed(2) : 0;
    const avgTime = this.metrics.requests > 0 ? (this.metrics.totalTime / this.metrics.requests).toFixed(2) : 0;

    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) : 0,
      averageResponseTime: avgTime + 'ms',
      cacheHitRate: cacheRate + '%',
      totalQueries: this.metrics.queries.length,
      slowQueries: this.metrics.queries
        .filter(q => q.duration > 1000)
        .length
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit = 10) {
    return this.metrics.queries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

module.exports = new PerformanceMetrics();
