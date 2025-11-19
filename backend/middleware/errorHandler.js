class ErrorHandler {
    static handle(err, req, res, next) {
        console.error('Error occurred:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                details: err.message
            });
        }

        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or missing authentication token'
            });
        }

        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Resource already exists'
            });
        }

        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Referenced resource does not exist'
            });
        }

        res.status(err.status || 500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'production' 
                ? 'An error occurred processing your request' 
                : err.message
        });
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
