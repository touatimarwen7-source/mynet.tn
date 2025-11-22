/**
 * Enhanced Error Handler Utility
 * Comprehensive error handling with error codes, logging, and user notifications
 * 
 * Features:
 * - Centralized error formatting (error codes + messages)
 * - Authentication error handling
 * - Validation error formatting
 * - Retry logic for transient failures
 * - Development logging
 * - Error tracking integration (ready for production)
 */

import TokenManager from '../services/tokenManager';
import { formatError, getErrorFromStatusCode, SYSTEM_ERRORS } from './errorCodes';

export const errorHandler = {
  /**
   * Get user-friendly error message with code
   * @param {Error|Object} error - The error object
   * @param {string} defaultMessage - Fallback message if no error
   * @returns {Object} { code, message, severity }
   */
  getUserMessage: (error, defaultMessage = 'Une erreur est survenue') => {
    return formatError(error) || {
      code: 'UNKNOWN',
      message: defaultMessage,
      severity: 'error'
    };
  },

  /**
   * Get HTTP status-based error
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Error object { code, message, severity }
   */
  getStatusError: (statusCode) => {
    return getErrorFromStatusCode(statusCode);
  },

  /**
   * Check if error is auth-related
   * @param {Error|Object} error - The error to check
   * @returns {boolean} True if authentication error
   */
  isAuthError: (error) => {
    const status = error.response?.status;
    return status === 401 || status === 403;
  },

  /**
   * Handle authentication error and logout
   * @returns {void}
   */
  handleAuthError: () => {
    TokenManager.clearTokens();
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/login';
  },

  /**
   * Check if error is retryable
   * @param {Error|Object} error - The error to check
   * @returns {boolean} True if request should be retried
   */
  isRetryable: (error) => {
    const status = error.response?.status;
    const code = error.code;
    
    // Retry on timeout, rate limit, server error, or network error
    return (
      status === 408 ||        // Request Timeout
      status === 429 ||        // Too Many Requests
      (status >= 500 && status < 600) ||  // Server errors
      code === 'ECONNABORTED' || // Connection aborted
      code === 'ERR_NETWORK'     // Network error
    );
  },

  /**
   * Format validation errors from Zod or custom validation
   * @param {Object|Array} errors - Validation errors
   * @returns {Object} Formatted errors { fieldName: { code, message } }
   */
  formatValidationErrors: (errors) => {
    if (!errors) return {};
    
    const formatted = {};

    if (errors.errors) {
      // Zod format
      errors.errors.forEach(err => {
        const field = err.path.join('.');
        formatted[field] = {
          code: 'V005',
          message: err.message
        };
      });
    } else if (Array.isArray(errors)) {
      // Array format
      errors.forEach(err => {
        if (err.field) {
          formatted[err.field] = {
            code: 'V005',
            message: err.message
          };
        }
      });
    } else if (typeof errors === 'object') {
      // Object format
      Object.entries(errors).forEach(([field, message]) => {
        formatted[field] = {
          code: 'V005',
          message: Array.isArray(message) ? message[0] : message
        };
      });
    }

    return formatted;
  },

  /**
   * Log error for debugging/monitoring
   * @param {Error|Object} error - The error to log
   * @param {string} context - Where error occurred
   * @returns {Object} Error info logged
   */
  logError: (error, context = 'UNKNOWN') => {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      code: error?.response?.data?.code || error?.code || 'UNKNOWN',
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      url: error?.response?.config?.url
    };

    // Development: console.error
    if (import.meta.env.MODE === 'development') {
      console.error(
        `[${context}] [${errorInfo.code}] ${errorInfo.message}`,
        error
      );
    }

    // Production: Send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.MODE === 'production') {
      // TODO: Integrate with error tracking service
      // window.errorTrackingService?.captureException(errorInfo);
    }

    return errorInfo;
  },

  /**
   * Safe error handler wrapper for promise chains
   * Returns [error, data] tuple (Go-like error handling)
   * @param {Promise} promise - Promise to handle
   * @returns {Promise<[Object|null, any]>} [error, data] tuple
   */
  handle: async (promise) => {
    try {
      const data = await promise;
      return [null, data];
    } catch (error) {
      return [errorHandler.getUserMessage(error), null];
    }
  },

  /**
   * Retry failed request with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum retry attempts (default: 3)
   * @param {number} initialDelay - Initial delay in ms (default: 1000)
   * @returns {Promise} Result of function
   */
  retry: async (fn, maxRetries = 3, initialDelay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry if not retryable or on last attempt
        if (!errorHandler.isRetryable(error) || attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
};

export default errorHandler;
