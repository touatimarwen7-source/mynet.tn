// Request ID tracking middleware for monitoring
const crypto = require('crypto');

const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = crypto.randomUUID();
  
  // Add to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Log request ID for tracking
  const originalSend = res.send;
  res.send = function(data) {
    // Tracking removed;
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = requestIdMiddleware;
