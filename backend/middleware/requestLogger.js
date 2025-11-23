/**
 * 📝 REQUEST LOGGER
 * Improved request logging with structured format
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.id || 'unknown';

  // Log request
  const logData = {
    id: requestId,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress
  };

  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    logData.statusCode = res.statusCode;
    logData.duration = duration + 'ms';
    logData.cached = res.getHeader('X-Cache') || 'N/A';

    // Only log errors and slow requests
    if (res.statusCode >= 400 || duration > 1000) {
      // Request loggedId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
