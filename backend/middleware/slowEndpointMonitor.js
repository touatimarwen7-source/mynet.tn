
/**
 * 🐌 Slow Endpoint Monitoring Middleware
 * Tracks and logs slow API endpoints for optimization
 */

const { logger } = require('../utils/logger');

class SlowEndpointMonitor {
  constructor() {
    this.slowThreshold = 1000; // 1 second
    this.slowEndpoints = new Map();
    this.metrics = {
      totalRequests: 0,
      slowRequests: 0,
      averageResponseTime: 0,
    };
  }

  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const endpoint = `${req.method} ${req.path}`;

      // Capture response finish
      const originalEnd = res.end;
      res.end = (...args) => {
        const duration = Date.now() - startTime;
        this.metrics.totalRequests++;

        // Track slow endpoints
        if (duration > this.slowThreshold) {
          this.metrics.slowRequests++;
          this.trackSlowEndpoint(endpoint, duration, req);

          // Log slow request
          logger.warn('Slow endpoint detected', {
            endpoint,
            duration: `${duration}ms`,
            method: req.method,
            query: req.query,
            statusCode: res.statusCode,
          });
        }

        // Update average
        this.metrics.averageResponseTime = Math.round(
          (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration) /
            this.metrics.totalRequests
        );

        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        if (duration > this.slowThreshold) {
          res.setHeader('X-Performance-Warning', 'slow');
        }

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  trackSlowEndpoint(endpoint, duration, req) {
    if (!this.slowEndpoints.has(endpoint)) {
      this.slowEndpoints.set(endpoint, {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        samples: [],
      });
    }

    const stats = this.slowEndpoints.get(endpoint);
    stats.count++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);

    // Keep last 10 samples
    stats.samples.push({
      duration,
      timestamp: new Date().toISOString(),
      query: req.query,
      statusCode: req.res?.statusCode,
    });
    if (stats.samples.length > 10) {
      stats.samples.shift();
    }
  }

  getMetrics() {
    const slowEndpointsArray = Array.from(this.slowEndpoints.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        maxDuration: stats.maxDuration,
        samples: stats.samples,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);

    return {
      ...this.metrics,
      slowRate: `${((this.metrics.slowRequests / this.metrics.totalRequests) * 100).toFixed(2)}%`,
      slowEndpoints: slowEndpointsArray.slice(0, 20), // Top 20
    };
  }

  reset() {
    this.slowEndpoints.clear();
    this.metrics = {
      totalRequests: 0,
      slowRequests: 0,
      averageResponseTime: 0,
    };
  }
}

const monitor = new SlowEndpointMonitor();

module.exports = {
  slowEndpointMonitor: monitor.middleware.bind(monitor),
  getSlowEndpointMetrics: () => monitor.getMetrics(),
  resetSlowEndpointMetrics: () => monitor.reset(),
};
