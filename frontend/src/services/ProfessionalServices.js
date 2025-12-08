/**
 * Services professionnels unifiés
 * Ensemble de services auxiliaires avec des spécifications mondiales
 */

import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Service de gestion des données
 */
export const DataService = {
  /**
   * Formatage de la devise
   */
  formatCurrency: (value, currency = 'TND') => {
    return new Intl.NumberFormat('fr-TN').format(value) + ' ' + currency;
  },

  /**
   * Formatage de la date
   */
  formatDate: (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  },

  /**
   * Calcul de la différence temporelle
   */
  getTimeAgo: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 30) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return this.formatDate(date);
  },

  /**
   * Calcul du pourcentage
   */
  calculatePercentage: (value, total) => {
    return ((value / total) * 100).toFixed(1);
  },

  /**
   * Formatage des grands nombres
   */
  formatNumber: (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  },
};

/**
 * Validation Service
 */
export const ValidationService = {
  /**
   * Validate email address
   */
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate phone number
   */
  isValidPhone: (phone) => {
    const regex = /^[0-9]{8,}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate password strength
   */
  isStrongPassword: (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  },

  /**
   * Validate required fields
   */
  validateRequired: (fields) => {
    return Object.values(fields).every((field) => field && field.trim() !== '');
  },
};

/**
 * Notification Service
 */
export const NotificationService = {
  /**
   * Alerts list
   */
  alerts: [],

  /**
   * Add alert
   */
  add: function (message, type = 'info') {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    this.alerts.push(alert);
    logger.info(`Alert: ${message}`);
    return alert;
  },

  /**
   * Remove alert
   */
  remove: function (id) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
  },

  /**
   * Get all alerts
   */
  getAll: function () {
    return this.alerts;
  },
};

/**
 * Filter Service
 */
export const FilterService = {
  /**
   * Filter data
   */
  filter: (data, criteria) => {
    return data.filter((item) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (!value) return true;
        return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  },

  /**
   * Sort data
   */
  sort: (data, field, direction = 'asc') => {
    return [...data].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Group data
   */
  group: (data, field) => {
    return data.reduce((acc, item) => {
      const key = item[field];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  },
};

/**
 * Performance Service
 */
export const PerformanceService = {
  /**
   * Measure response time
   */
  measureResponseTime: async (asyncFn) => {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const end = performance.now();
      return {
        result,
        duration: (end - start).toFixed(2),
        success: true,
      };
    } catch (error) {
      const end = performance.now();
      return {
        error,
        duration: (end - start).toFixed(2),
        success: false,
      };
    }
  },

  /**
   * Measure memory usage
   */
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
      };
    }
    return null;
  },
};

/**
 * Storage Service
 */
export const StorageService = {
  /**
   * Save data
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Storage set error:', error);
      return false;
    }
  },

  /**
   * Retrieve data
   */
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Remove data
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('Storage remove error:', error);
      return false;
    }
  },

  /**
   * Clear storage
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Storage clear error:', error);
      return false;
    }
  },
};
