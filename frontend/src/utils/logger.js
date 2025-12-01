/**
 * @file logger.js
 * @description A comprehensive frontend logging system with different levels,
 * structured formatting, and optional backend persistence.
 */

// Defines the hierarchy of log levels.
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

/**
 * @class Logger
 * @description A class to create a structured logger instance.
 */
class Logger {
  constructor(name = 'App', minLevel = LOG_LEVELS.INFO) {
    this.name = name;
    this.minLevel = minLevel;
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
    this.enableRemote = false; // Set to true to send to backend
  }

  /**
   * Formats a log entry into a structured object.
   * @param {string} level - The log level (e.g., 'INFO', 'ERROR').
   * @param {string} message - The main log message.
   * @param {object} [data={}] - Additional data to include with the log.
   * @returns {object} The formatted log entry.
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
   * Stores a log entry in an in-memory array.
   * @param {object} logEntry - The log entry to store.
   */
  store(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Sends a log entry to a backend logging endpoint.
   * @param {object} logEntry - The log entry to send.
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
   * The core logging method that formats, stores, and outputs a log message.
   * @param {string} level - The log level.
   * @param {string} message - The log message.
   * @param {object} [data={}] - Additional data.
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

  /**
   * Gets the appropriate console style for a given log level.
   * @param {string} level - The log level.
   * @returns {string} The CSS style string for the console.
   */
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

  // --- Convenience methods for each log level ---
  debug(message, data) { this.log('DEBUG', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
  fatal(message, data) { this.log('FATAL', message, data); }

  /**
   * Retrieves all logs currently stored in memory.
   * @returns {Array<object>} An array of log entries.
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Clears all logs from memory.
   */
  clear() {
    this.logs = [];
  }

  /**
   * Exports all in-memory logs as a JSON string.
   * @returns {string} A JSON string representing the logs.
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Sets the minimum log level for this logger instance.
   * @param {string} level - The minimum log level to output (e.g., 'WARN').
   */
  setLevel(level) {
    this.minLevel = LOG_LEVELS[level];
  }
}

/**
 * The global, default logger instance for the application.
 * @type {Logger}
 */
export const logger = new Logger('MyNet', LOG_LEVELS.INFO);

/**
 * Factory function to create a new named logger instance.
 * @param {string} name - The name for the new logger (e.g., 'API', 'Auth').
 * @param {string} [level='INFO'] - The minimum log level for this instance.
 * @returns {Logger} A new Logger instance.
 */
export function createLogger(name, level = 'INFO') {
  return new Logger(name, LOG_LEVELS[level]);
}

// Export log levels
export { LOG_LEVELS };

export default logger;
