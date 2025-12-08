/**
 * Performance Monitoring Middleware
 * Tracks response times and performance metrics
 */

const { logger } = require('../utils/logger');

const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to ms

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        path: req.path,
        duration: `${duration.toFixed(2)}ms`,
        status: res.statusCode
      });
    }
  });

  // Set header before response is sent
  const originalSend = res.send;
  res.send = function (data) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to ms
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    }
    return originalSend.call(this, data);
  };

  next();
};

module.exports = performanceMiddleware;