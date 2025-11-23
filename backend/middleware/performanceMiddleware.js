// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Track slow requests
    if (duration > 1000) {
      const performanceMetrics = require('../utils/performanceMetrics');
      performanceMetrics.recordSlowRequest({
        method: req.method,
        path: req.path,
        duration
      });
    }
    
    // Track response time
    req.responseTime = duration;
  });
  
  next();
};

module.exports = performanceMiddleware;
