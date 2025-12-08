/**
 * 🔐 UNIFIED 401 ERROR HANDLER
 * Provides consistent error context for all authentication failures
 */

const unified401Handler = (req, res, next) => {
  /**
   * Middleware to provide detailed 401 context
   * Attaches helper method to response object
   */
  res.unauthorized = (details = {}) => {
    const response = {
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: details.message || 'Authentication required or token invalid',
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
    };

    // Add contextual information
    if (details.reason) {
      response.reason = details.reason;
    }
    if (details.retryAfter) {
      response.retryAfter = details.retryAfter;
      res.set('Retry-After', details.retryAfter);
    }
    if (details.redirect) {
      response.redirect = details.redirect;
    }

    // Log the 401 incident
    console.log('[401 UNAUTHORIZED]', {
      id: req.id,
      path: req.path,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      reason: details.reason || 'unknown',
      timestamp: new Date().toISOString(),
    });

    return res.status(401).json(response);
  };

  next();
};

module.exports = unified401Handler;er;
