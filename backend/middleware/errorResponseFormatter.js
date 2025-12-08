/**
 * 🔴 ERROR RESPONSE FORMATTER
 * Standardizes error responses across all endpoints
 */

const errorResponseFormatter = (err, req, res, next) => {
  const errorCode = err.code || err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';
  const errorType = err.type || 'INTERNAL_ERROR';

  const response = {
    success: false,
    error: {
      type: errorType,
      message: errorMessage,
      code: errorCode,
      requestId: req.id || 'unknown',
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(errorCode).json(response);
};

/**
 * Helper function for direct error responses
 */
const errorResponse = (res, message, statusCode = 500, errorCode = 'ERROR') => {
  const response = {
    success: false,
    error: {
      type: errorCode,
      message: message,
      code: statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(statusCode).json(response);
};

module.exports = errorResponseFormatter;
module.exports.errorResponse = errorResponse;se;
