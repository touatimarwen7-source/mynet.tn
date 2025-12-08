
/**
 * Unified Database Error Handler
 * Handles all database errors consistently
 */

const { logger } = require('./logger');
const { ErrorResponseFormatter } = require('./errorHandler');
const { 
  ValidationError, 
  ConflictError, 
  DatabaseError 
} = require('./errorClasses');

/**
 * Handle PostgreSQL errors
 */
function handleDatabaseError(error) {
  // Log the error
  logger.error('Database Error:', {
    message: error.message,
    code: error.code,
    detail: error.detail,
    stack: error.stack
  });

  // Handle specific PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique constraint violation
      return new ConflictError(
        'Cette ressource existe déjà',
        { constraint: error.constraint }
      );

    case '23503': // Foreign key violation
      return new ValidationError(
        'Référence invalide à une ressource inexistante',
        { constraint: error.constraint }
      );

    case '23502': // Not null violation
      return new ValidationError(
        'Un champ obligatoire est manquant',
        { column: error.column }
      );

    case '23514': // Check constraint violation
      return new ValidationError(
        'Valeur invalide pour ce champ',
        { constraint: error.constraint }
      );

    case '22P02': // Invalid text representation
      return new ValidationError(
        'Format de données invalide',
        { detail: error.message }
      );

    case '42P01': // Undefined table
      return new DatabaseError(
        'Erreur de configuration de la base de données'
      );

    case '08006': // Connection failure
    case '08000': // Connection exception
      return new DatabaseError(
        'Impossible de se connecter à la base de données'
      );

    case '57014': // Query canceled
      return new DatabaseError(
        'La requête a pris trop de temps et a été annulée'
      );

    default:
      return new DatabaseError(
        'Erreur lors de l\'opération sur la base de données',
        error
      );
  }
}

/**
 * Format database error for client response
 */
function formatDatabaseError(error) {
  const appError = handleDatabaseError(error);
  return ErrorResponseFormatter.error(appError, appError.statusCode);
}

/**
 * Middleware to catch database errors
 */
function databaseErrorMiddleware(error, req, res, next) {
  // Check if it's a database error
  if (error.code && (error.code.startsWith('23') || error.code.startsWith('42') || error.code.startsWith('08'))) {
    const formattedError = formatDatabaseError(error);
    return res.status(formattedError.statusCode).json(formattedError);
  }
  
  // Pass to next error handler
  next(error);
}

module.exports = {
  handleDatabaseError,
  formatDatabaseError,
  databaseErrorMiddleware
};orMiddleware
};
