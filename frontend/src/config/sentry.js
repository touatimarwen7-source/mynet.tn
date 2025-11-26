/**
 * Sentry Configuration for Frontend
 * Provides error tracking, performance monitoring, and session replay
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for React frontend
 * @returns {void}
 */
export function initializeSentry() {
  const sentryDSN = import.meta.env.VITE_SENTRY_DSN || '';
  const environment = import.meta.env.MODE || 'development';

  // Only initialize if DSN is provided
  if (!sentryDSN) {
    console.warn('⚠️ Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    environment: environment,
    integrations: [
      new BrowserTracing(),
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out network errors in development
      if (event.exception) {
        const error = event.exception.values?.[0]?.value;
        if (error?.includes('Network') && environment === 'development') {
          return null;
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry frontend error tracking initialized');
}

/**
 * Capture exception
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {void}
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    tags: {
      component: context.component,
      page: context.page,
    },
    extra: context,
  });
}

/**
 * Capture message
 * @param {string} message - Message to track
 * @param {string} level - Severity level
 * @param {Object} context - Additional context
 * @returns {void}
 */
export function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, level);
  if (Object.keys(context).length > 0) {
    Sentry.setContext('custom', context);
  }
}

/**
 * Add breadcrumb
 * @param {string} message - Breadcrumb message
 * @param {string} category - Breadcrumb category
 * @param {string} level - Severity level
 * @returns {void}
 */
export function addBreadcrumb(message, category = 'info', level = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 * @param {string} userId - User ID
 * @param {Object} userInfo - Additional user info
 * @returns {void}
 */
export function setUserContext(userId, userInfo = {}) {
  Sentry.setUser({
    id: userId,
    ...userInfo,
  });
}

/**
 * Clear user context
 * @returns {void}
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Create error boundary wrapper
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
