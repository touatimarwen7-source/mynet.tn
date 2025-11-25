/**
 * 📊 ANALYTICS SYSTEM (#40)
 * Track user events, page views, and performance metrics
 */

class Analytics {
  constructor() {
    this.events = [];
    this.maxEvents = 500;
    this.enableRemote = false; // Set to true to send to backend
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.startTime = Date.now();
    
    // Track page views automatically
    this.trackPageView();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, eventData = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventName,
      eventData,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    this.sendToBackend(event);
    return event;
  }

  /**
   * Track page view
   */
  trackPageView(page = window.location.pathname) {
    this.trackEvent('page_view', { page });
  }

  /**
   * Track user action
   */
  trackAction(action, details = {}) {
    this.trackEvent(`action_${action}`, details);
  }

  /**
   * Track performance metric
   */
  trackMetric(metricName, value, unit = '') {
    this.trackEvent(`metric_${metricName}`, { value, unit });
  }

  /**
   * Track error
   */
  trackError(errorName, errorMessage, stackTrace = '') {
    this.trackEvent('error', {
      errorName,
      errorMessage,
      stackTrace,
    });
  }

  /**
   * Set user ID (call after login)
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Send event to backend
   */
  async sendToBackend(event) {
    if (!this.enableRemote) return;

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Error tracked;
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    const now = Date.now();
    const sessionDuration = now - this.startTime;
    
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: this.events.length,
      sessionDuration: sessionDuration,
      sessionDurationMinutes: Math.round(sessionDuration / 1000 / 60),
      eventTypes: [...new Set(this.events.map(e => e.eventName))],
    };
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      stats: this.getStats(),
      events: this.events,
    };
  }

  /**
   * Clear events
   */
  clear() {
    this.events = [];
  }

  /**
   * Track time spent on page
   */
  trackTimeSpent(pageName, callback) {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.trackMetric('time_spent', duration, 'ms');
      callback?.(duration);
    };
  }

  /**
   * Measure function execution time
   */
  measure(functionName, fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    this.trackMetric(`function_${functionName}`, duration, 'ms');
    return result;
  }
}

// Global analytics instance
export const analytics = new Analytics();

export default analytics;
