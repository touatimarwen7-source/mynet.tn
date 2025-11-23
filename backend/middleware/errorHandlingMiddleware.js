/**
 * 🛡️ COMPREHENSIVE ERROR HANDLING MIDDLEWARE
 * Catches, logs, and responds to all errors uniformly
 */

const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError
} = require('../utils/errorClasses');

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized responses
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: err.statusCode,
    message: err.message,
    requestId: req.id,
    userId: req.user?.id || 'anonymous',
    ipAddress: req.clientIP
  };

  // Log based on severity
  if (err.statusCode >= 500) {
    // Error trackedLog, null, 2));
    if (process.env.NODE_ENV === 'development') {
      // Error tracking removed;
    }
  } else if (err.statusCode >= 400) {
    // Warning tracking removed);
  }

  // Handle specific error types
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ConflictError(`${field} already exists`, { field, value: err.keyValue[field] });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const details = Object.entries(err.errors).reduce((acc, [key, error]) => {
      acc[key] = error.message;
      return acc;
    }, {});
    err = new ValidationError('Validation failed', details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    err = new AuthenticationError('Token expired');
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    // Unique constraint violation
    const field = err.constraint || 'field';
    err = new ConflictError(`${field} already exists`, { field });
  }

  if (err.code === '23503') {
    // Foreign key constraint violation
    err = new ValidationError('Invalid reference to related data', { constraint: err.constraint });
  }

  if (err.code === '42P01') {
    // Undefined table
    err = new DatabaseError('Database table not found', err);
  }

  // Prepare error response
  const response = {
    success: false,
    error: {
      message: err.message,
      code: err.code || err.name || 'UNKNOWN_ERROR',
      statusCode: err.statusCode,
      requestId: req.id
    }
  };

  // Add details if present
  if (err.details && Object.keys(err.details).length > 0) {
    response.error.details = err.details;
  }

  // Add validation errors if present
  if (err.validation) {
    response.error.validation = err.validation;
  }

  // Add timestamp
  response.error.timestamp = new Date().toISOString();

  // Development: include stack trace
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack.split('\n');
  }

  // Send error response
  res.status(err.statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError('Endpoint');
  err.message = `Cannot ${req.method} ${req.originalUrl}`;
  globalErrorHandler(err, req, res, next);
};

/**
 * Error Handling for Route Parameters
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ValidationError('ID parameter is required'));
  }

  // Validate ID format (UUID or numeric)
  const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/i.test(id);

  if (!isValidId) {
    return next(new ValidationError('Invalid ID format', { id }));
  }

  next();
};

/**
 * Validation Error Response Helper
 */
const sendValidationError = (res, errors, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode,
      validation: errors,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Success Response Helper
 */
const sendSuccess = (res, data = null, statusCode = 200, message = 'Success') => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Paginated Success Response
 */
const sendPaginatedSuccess = (res, data, total, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Error Response Helper
 */
const sendError = (res, message, statusCode = 500, details = {}) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: 'ERROR',
      statusCode,
      details: Object.keys(details).length > 0 ? details : undefined,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  validateIdParam,
  sendValidationError,
  sendSuccess,
  sendPaginatedSuccess,
  sendError
};
