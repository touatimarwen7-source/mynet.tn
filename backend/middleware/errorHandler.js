const ResponseFormatter = require('../utils/responseFormatter');
const ErrorTrackingService = require('../services/ErrorTrackingService');

class ErrorHandler {
    static handle(err, req, res, next) {
        // Log error via ErrorTrackingService instead of console
        ErrorTrackingService.logError('REQUEST_ERROR', err, {
            path: req.path,
            method: req.method,
            requestId: req.id
        });

        // Unified error response formatting
        const statusCode = this._getStatusCode(err);
        const errorResponse = ResponseFormatter.error(
            this._getMessage(err),
            this._getErrorCode(err),
            statusCode
        );

        res.status(statusCode).json(errorResponse);
    }

    static _getStatusCode(err) {
        if (err.name === 'ValidationError') return 400;
        if (err.name === 'UnauthorizedError') return 401;
        if (err.code === '23505') return 409; // Unique violation
        if (err.code === '23503') return 400; // Foreign key violation
        return err.status || 500;
    }

    static _getErrorCode(err) {
        if (err.name === 'ValidationError') return 'VALIDATION_ERROR';
        if (err.name === 'UnauthorizedError') return 'UNAUTHORIZED';
        if (err.code === '23505') return 'CONFLICT';
        if (err.code === '23503') return 'FOREIGN_KEY_VIOLATION';
        return 'INTERNAL_ERROR';
    }

    static _getMessage(err) {
        if (err.name === 'ValidationError') return err.message;
        if (err.name === 'UnauthorizedError') return 'Invalid or missing authentication token';
        if (err.code === '23505') return 'Resource already exists';
        if (err.code === '23503') return 'Referenced resource does not exist';
        return process.env.NODE_ENV === 'production' 
            ? 'An error occurred processing your request' 
            : err.message;
    }

    static notFound(req, res) {
        res.status(404).json({
            error: 'Not Found',
            message: 'The requested resource was not found',
            path: req.path
        });
    }
}

module.exports = ErrorHandler;
