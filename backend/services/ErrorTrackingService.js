const fs = require('fs');
const path = require('path');

/**
 * 🔍 ERROR TRACKING SERVICE
 * Centralized error monitoring and logging
 * Tracks: errors, warnings, performance issues
 * Outputs: structured logs + error statistics
 */
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.maxErrors = 1000;
    this.errorCounts = new Map();
    this.errorPatterns = new Map();
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  /**
   * Ensure logs directory exists (create if missing)
   * @private
   * @returns {void}
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Track an error with full context (endpoint, user, request body)
   * @param {Error} error - Error object to track
   * @param {Object} [context={}] - Additional context about error
   * @param {string} [context.severity='error'] - Error severity level
   * @param {string} [context.userId] - ID of affected user
   * @param {string} [context.endpoint] - API endpoint where error occurred
   * @param {string} [context.method] - HTTP method
   * @param {number} [context.statusCode=500] - HTTP status code
   * @param {Object} [context.requestBody] - Request payload (sanitized)
   * @returns {Object} Error record that was tracked
   */
  trackError(error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      code: error.code || 'UNKNOWN',
      severity: context.severity || 'error',
      userId: context.userId,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode || 500,
      requestBody: this.sanitize(context.requestBody),
      context: context
    };

    this.errors.push(errorRecord);
    this.updateStats(errorRecord);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.persistError(errorRecord);
    return errorRecord;
  }

  /**
   * Track a warning without full error details
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional context
   * @param {string} [context.userId] - Affected user ID
   * @param {string} [context.endpoint] - API endpoint
   * @returns {Object} Warning record that was tracked
   */
  trackWarning(message, context = {}) {
    const warning = {
      timestamp: new Date().toISOString(),
      message,
      severity: 'warning',
      userId: context.userId,
      endpoint: context.endpoint
    };

    this.warnings.push(warning);
    
    if (this.warnings.length > 500) {
      this.warnings.shift();
    }

    return warning;
  }

  /**
   * Update error statistics and patterns
   * @private
   * @param {Object} errorRecord - Error record to update stats from
   * @returns {void}
   */
  updateStats(errorRecord) {
    const pattern = `${errorRecord.code}:${errorRecord.endpoint}`;
    
    if (this.errorCounts.has(pattern)) {
      this.errorCounts.set(pattern, this.errorCounts.get(pattern) + 1);
    } else {
      this.errorCounts.set(pattern, 1);
    }

    if (this.errorPatterns.has(errorRecord.code)) {
      const count = this.errorPatterns.get(errorRecord.code);
      this.errorPatterns.set(errorRecord.code, count + 1);
    } else {
      this.errorPatterns.set(errorRecord.code, 1);
    }
  }

  /**
   * Remove sensitive data from logs (passwords, tokens, credit cards)
   * @private
   * @param {Object} data - Data to sanitize
   * @returns {Object|null} Sanitized data or null if input is null
   */
  sanitize(data) {
    if (!data) return null;

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'credit_card'];
    const sanitized = JSON.parse(JSON.stringify(data));

    const recursiveSanitize = (obj) => {
      for (const key in obj) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          recursiveSanitize(obj[key]);
        }
      }
    };

    recursiveSanitize(sanitized);
    return sanitized;
  }

  /**
   * Persist error record to daily JSON log file
   * @private
   * @param {Object} errorRecord - Error record to persist
   * @returns {void}
   */
  persistError(errorRecord) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `errors-${date}.json`);

    try {
      let data = [];
      if (fs.existsSync(logFile)) {
        data = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
      data.push(errorRecord);
      fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
    } catch (e) {
      // Persistence error - continue anyway
    }
  }

  /**
   * Get aggregate error statistics
   * @returns {Object} Stats including total errors, patterns, and top errors
   */
  getStats() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errorPatterns: Object.fromEntries(this.errorPatterns),
      topErrors: Array.from(this.errorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([pattern, count]) => ({ pattern, count }))
    };
  }

  /**
   * Get most recent errors up to specified limit
   * @param {number} [limit=20] - Number of recent errors to return
   * @returns {Array} Array of recent error records (reversed to show newest first)
   */
  getRecentErrors(limit = 20) {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Get errors filtered by severity level
   * @param {string} severity - Severity level to filter (error, warning, critical, etc)
   * @returns {Array} Array of errors matching severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Clear old errors keeping only recent days
   * @param {number} [daysToKeep=7] - Number of days of errors to retain
   * @returns {void}
   */
  clearOldErrors(daysToKeep = 7) {
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - daysToKeep);

    this.errors = this.errors.filter(e => new Date(e.timestamp) > cutoffTime);
  }

  /**
   * Export comprehensive error report for analysis
   * @returns {Object} Report including stats, recent errors and warnings
   */
  exportReport() {
    return {
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      recentErrors: this.getRecentErrors(50),
      recentWarnings: this.warnings.slice(-50)
    };
  }
}

const errorTracker = new ErrorTracker();

module.exports = {
  errorTracker,
  ErrorTracker
};
