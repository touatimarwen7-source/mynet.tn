/**
 * 📝 BACKEND LOGGING SYSTEM
 * Comprehensive server-side logging with file persistence
 */

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

class Logger {
  constructor(name = 'App', logDir = './logs') {
    this.name = name;
    this.logDir = logDir;
    this.logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    this.minLevel = LOG_LEVELS.INFO;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  format(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      logger: this.name,
      message,
      data: typeof data === 'object' ? JSON.stringify(data) : data,
      pid: process.pid,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    };
  }

  /**
   * Write to file
   */
  writeToFile(logEntry) {
    const line = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, line, 'utf8');
  }

  /**
   * Core logging method
   */
  log(level, message, data = {}) {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const logEntry = this.format(level, message, data);
    this.writeToFile(logEntry);

    // Console output with color
    const colorCode = this.getColorCode(level);
    console.log(
      `${colorCode}[${level}]${'\x1b[0m'} ${this.name}: ${message}`,
      data
    );
  }

  getColorCode(level) {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[34m',  // Blue
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    };
    return colors[level] || '';
  }

  // Convenience methods
  debug(message, data) { this.log('DEBUG', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
  fatal(message, data) { this.log('FATAL', message, data); }

  /**
   * Express middleware for request logging
   */
  requestMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      const originalEnd = res.end;

      res.end = function(...args) {
        const duration = Date.now() - start;
        this.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          userId: req.user?.id,
        });
        originalEnd.apply(this, args);
      };

      next();
    };
  }
}

// Global logger instance
const logger = new Logger('MyNet.tn');

module.exports = { logger, Logger, LOG_LEVELS };
