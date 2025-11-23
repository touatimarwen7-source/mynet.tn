/**
 * 📊 QUERY MONITOR MIDDLEWARE
 * Tracks slow queries and suggests optimizations
 */

class QueryMonitor {
  constructor() {
    this.slowQueries = [];
    this.slowQueryThreshold = 1000; // 1 second
    this.maxTracked = 100;
  }

  /**
   * Middleware to track query performance
   */
  trackQueryPerformance(req, res, next) {
    const originalQuery = req.app.get('db')?.query;
    
    if (originalQuery) {
      req.app.get('db').query = async (...args) => {
        const start = Date.now();
        try {
          const result = await originalQuery.apply(req.app.get('db'), args);
          const duration = Date.now() - start;

          if (duration > this.slowQueryThreshold) {
            this.trackSlowQuery(args[0], duration, req);
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;
          throw error;
        }
      };
    }

    next();
  }

  /**
   * Track a slow query
   */
  trackSlowQuery(query, duration, req) {
    const record = {
      timestamp: new Date().toISOString(),
      query: query.substring(0, 200),
      duration,
      endpoint: req.path,
      method: req.method
    };

    this.slowQueries.push(record);
    if (this.slowQueries.length > this.maxTracked) {
      this.slowQueries.shift();
    }
  }

  /**
   * Get slow query stats
   */
  getSlowQueries(limit = 10) {
    return this.slowQueries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

module.exports = new QueryMonitor();
