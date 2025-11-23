/**
 * ⚡ ENHANCED ASYNC ERROR HANDLER
 * Comprehensive error handling for all 65+ async operations
 * Adds logging, timeouts, and graceful degradation
 */

const { withTimeout } = require('./timeoutMiddleware');
const { recordQueryAudit, detectSQLInjectionPattern } = require('./sqlInjectionAudit');

/**
 * Enhanced async handler with error tracking
 * Wraps all async route handlers with timeout, error handling, and logging
 */
const enhancedAsyncHandler = (operationName, timeoutMs = 30000) => {
  return (fn) => {
    return async (req, res, next) => {
      const startTime = Date.now();
      const operationId = `${operationName}_${Date.now()}_${Math.random()}`;

      try {
        // Wrap with timeout
        const result = await withTimeout(
          fn(req, res, next),
          timeoutMs
        );

        const duration = Date.now() - startTime;
        console.log(`✅ [${operationName}] Success (${duration}ms)`);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Log error details
        const errorLog = {
          operationId,
          operationName,
          timestamp: new Date().toISOString(),
          duration,
          method: req.method,
          path: req.path,
          userId: req.user?.id || 'anonymous',
          error: error.message,
          statusCode: error.statusCode || 500
        };

        console.error(`❌ [${operationName}] Error:`, errorLog);

        // Check for SQL injection patterns in error
        if (error.message && detectSQLInjectionPattern(error.message)) {
          console.warn('🚨 Potential SQL injection detected in error message');
        }

        // Pass to global error handler
        next(error);
      }
    };
  };
};

/**
 * Operation tracker - for monitoring 65+ operations
 */
class OperationTracker {
  constructor() {
    this.operations = [];
  }

  record(operationName, duration, success, error = null) {
    this.operations.push({
      name: operationName,
      duration,
      success,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });

    // Keep last 1000 operations
    if (this.operations.length > 1000) {
      this.operations.shift();
    }
  }

  getStats() {
    const total = this.operations.length;
    const successful = this.operations.filter(o => o.success).length;
    const failed = total - successful;
    const avgDuration = total > 0
      ? Math.round(this.operations.reduce((sum, o) => sum + o.duration, 0) / total)
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) + '%' : 'N/A',
      averageDuration: avgDuration + 'ms'
    };
  }

  getRecentOperations(limit = 50) {
    return this.operations.slice(-limit);
  }
}

const operationTracker = new OperationTracker();

module.exports = {
  enhancedAsyncHandler,
  operationTracker
};
