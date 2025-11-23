/**
 * 📝 LOGGING SYSTEM (#9)
 * Comprehensive frontend logging with levels, formatting, and backend persistence
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

class Logger {
  constructor(name = 'App', minLevel = LOG_LEVELS.INFO) {
    this.name = name;
    this.minLevel = minLevel;
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
    this.enableRemote = false; // Set to true to send to backend
  }

  /**
   * Format log message
   */
  format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const stackTrace = new Error().stack?.split('\n').slice(2, 4).join('\n');
    
    return {
      timestamp,
      level,
      logger: this.name,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: level === 'ERROR' || level === 'FATAL' ? stackTrace : undefined,
    };
  }

  /**
   * Store log in memory
   */
  store(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Send log to backend (optional)
   */
  async sendToBackend(logEntry) {
    if (!this.enableRemote) return;
    
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Error tracked;
    }
  }

  /**
   * Core logging method
   */
  log(level, message, data = {}) {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const logEntry = this.format(level, message, data);
    this.store(logEntry);
    this.sendToBackend(logEntry);

    // Console output
    const style = this.getConsoleStyle(level);
    console.log(
      `%c[${level}] ${this.name}: ${message}`,
      style,
      data
    );
  }

  getConsoleStyle(level) {
    const styles = {
      DEBUG: 'color: #gray; font-size: 12px;',
      INFO: 'color: #0056B3; font-weight: bold;',
      WARN: 'color: #f57c00; font-weight: bold;',
      ERROR: 'color: #d32f2f; font-weight: bold;',
      FATAL: 'color: #d32f2f; background: #ffebee; font-weight: bold;',
    };
    return styles[level] || '';
  }

  // Convenience methods
  debug(message, data) { this.log('DEBUG', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
  fatal(message, data) { this.log('FATAL', message, data); }

  /**
   * Get all logs (for debugging)
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set minimum log level
   */
  setLevel(level) {
    this.minLevel = LOG_LEVELS[level];
  }
}

// Global logger instance
export const logger = new Logger('MyNet', LOG_LEVELS.INFO);

// Create named loggers for different modules
export function createLogger(name, level = 'INFO') {
  return new Logger(name, LOG_LEVELS[level]);
}

// Export log levels
export { LOG_LEVELS };

export default logger;
