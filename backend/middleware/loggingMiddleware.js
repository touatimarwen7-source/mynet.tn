// Logging middleware for error tracking
const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original res.json
  const originalJson = res.json;
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Track HTTP errors safely
    if (res.statusCode >= 400) {
      try {
        const ErrorTrackingService = require('../services/ErrorTrackingService');
        if (ErrorTrackingService && ErrorTrackingService.logError) {
          ErrorTrackingService.logError('HTTP_ERROR', new Error(`${res.statusCode} ${req.method} ${req.path}`), {
            method: req.method,
            path: req.path,
            duration: `${duration}ms`
          });
        }
      } catch (e) {
        // Silently ignore if ErrorTrackingService not available
      }
    }
    
    // Call original json
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = loggingMiddleware;
