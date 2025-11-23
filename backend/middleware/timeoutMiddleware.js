/**
 * ⏱️ REQUEST TIMEOUT ENFORCEMENT
 * Prevents hanging requests and resource exhaustion
 */

const GLOBAL_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds
const API_ENDPOINT_TIMEOUTS = {
  '/api/auth/login': 15000,
  '/api/auth/register': 20000,
  '/api/procurement/tenders': 20000,
  '/api/procurement/offers': 20000,
  '/api/admin': 25000,
  '/api/super-admin': 30000,
  '/api/export': 60000, // Exports can take longer
  '/api/backups': 60000,
};

/**
 * Request timeout middleware
 * Sends 408 Request Timeout if request exceeds limit
 */
const requestTimeout = (req, res, next) => {
  // Determine timeout based on endpoint
  let timeout = GLOBAL_TIMEOUT;
  
  for (const [pattern, customTimeout] of Object.entries(API_ENDPOINT_TIMEOUTS)) {
    if (req.path.startsWith(pattern)) {
      timeout = customTimeout;
      break;
    }
  }

  // Set timeout
  const timeoutHandle = setTimeout(() => {
    // Check if response already sent
    if (!res.headersSent) {
      // Timeout tracking}ms`);
      res.status(408).json({
        success: false,
        error: {
          message: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          statusCode: 408,
          details: {
            timeout: `${timeout}ms`,
            path: req.path,
            timestamp: new Date().toISOString()
          }
        }
      });
    }
    
    // Destroy socket to force close connection
    req.socket.destroy();
  }, timeout);

  // Clear timeout if response is sent
  res.on('finish', () => {
    clearTimeout(timeoutHandle);
  });

  res.on('close', () => {
    clearTimeout(timeoutHandle);
  });

  next();
};

/**
 * Custom timeout for specific operations
 * Use in async handlers where certain operations might be slow
 */
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

module.exports = {
  requestTimeout,
  withTimeout,
  GLOBAL_TIMEOUT,
  API_ENDPOINT_TIMEOUTS
};
