/**
 * Error Response Wrapper
 * Standardizes error responses across all endpoints
 */

const logger = require('./logger');

/**
 * Standard error response format
 */
class ErrorResponse {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    this.success = false;
    this.error = {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString()
    };
    if (details) {
      this.error.details = details;
    }
  }
}

/**
 * Validation error response
 */
class ValidationError extends ErrorResponse {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Not found error response
 */
class NotFoundError extends ErrorResponse {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized error response
 */
class UnauthorizedError extends ErrorResponse {
  constructor(message = 'Non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error response
 */
class ForbiddenError extends ErrorResponse {
  constructor(message = 'Accès refusé') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Conflict error response
 */
class ConflictError extends ErrorResponse {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Server error response
 */
class ServerError extends ErrorResponse {
  constructor(message = 'Erreur serveur interne', details = null) {
    super(message, 500, 'INTERNAL_ERROR', details);
    logger.error('Server Error:', { message, details });
  }
}

/**
 * Send standardized error response
 */
function sendErrorResponse(res, error, statusCode = 500) {
  let errorResponse;
  
  if (error instanceof ErrorResponse) {
    errorResponse = error;
    statusCode = error.error.statusCode;
  } else if (error instanceof Error) {
    errorResponse = new ServerError(error.message);
  } else if (typeof error === 'string') {
    errorResponse = new ServerError(error);
  } else {
    errorResponse = new ServerError('Erreur inconnue');
  }
  
  return res.status(statusCode).json(errorResponse);
}

/**
 * Send success response
 */
function sendSuccessResponse(res, data, statusCode = 200, message = 'Succès') {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  ErrorResponse,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServerError,
  sendErrorResponse,
  sendSuccessResponse
};
