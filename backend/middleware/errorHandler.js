class ErrorHandler {
  static handle(err, req, res, next) {
    // Prevent sending response if already sent
    if (res.headersSent) {
      return next(err);
    }

    try {
      // Get error details
      const statusCode = err.statusCode || err.status || 500;
      const errorCode = err.code || 'INTERNAL_ERROR';
      const message = this._getSafeMessage(err, statusCode);

      // Log error in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', {
          message: err.message,
          statusCode,
          path: req.path,
          method: req.method,
        });
      }

      // Send unified error response
      res.status(statusCode).json({
        success: false,
        error: {
          message,
          code: errorCode,
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Fallback if all else fails
      res.status(500).json({
        success: false,
        error: {
          message: 'Une erreur interne s\'est produite',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  static _getSafeMessage(err, statusCode) {
    // For production, limit error details
    if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
      return 'Une erreur s\'est produite lors du traitement de votre demande';
    }
    return err.message || 'Erreur inconnue';
  }

  static notFound(req, res) {
    res.status(404).json({
      success: false,
      error: {
        message: 'La ressource demandée n\'a pas été trouvée',
        code: 'NOT_FOUND',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

module.exports = ErrorHandler;
