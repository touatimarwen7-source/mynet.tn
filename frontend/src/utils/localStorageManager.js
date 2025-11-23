/**
 * 💾 LOCALSTORAGE ERROR HANDLER
 * Safe wrapper for localStorage operations with error handling
 */

class LocalStorageManager {
  /**
   * Check if localStorage is available
   */
  static isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      // Warning tracked;
      return false;
    }
  }

  /**
   * Safely set item in localStorage
   */
  static setItem(key, value) {
    try {
      if (!this.isAvailable()) {
        // Warning tracked;
        return this.setInMemory(key, value);
      }

      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
      return true;
    } catch (error) {
      // Error tracked;
      // Fallback to memory if quota exceeded
      return this.setInMemory(key, value);
    }
  }

  /**
   * Safely get item from localStorage
   */
  static getItem(key, defaultValue = null) {
    try {
      if (!this.isAvailable()) {
        return this.getInMemory(key, defaultValue);
      }

      const value = localStorage.getItem(key);
      if (!value) return defaultValue;

      // Try to parse as JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      // Error tracked;
      return this.getInMemory(key, defaultValue);
    }
  }

  /**
   * Safely remove item from localStorage
   */
  static removeItem(key) {
    try {
      if (!this.isAvailable()) {
        return this.removeInMemory(key);
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // Error tracked;
      return this.removeInMemory(key);
    }
  }

  /**
   * Safely clear all localStorage
   */
  static clear() {
    try {
      if (!this.isAvailable()) {
        this.clearMemory();
        return true;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      // Error tracked;
      this.clearMemory();
      return false;
    }
  }

  /**
   * Get all keys in localStorage
   */
  static getAllKeys() {
    try {
      if (!this.isAvailable()) {
        return Object.keys(this.memoryStore);
      }

      return Object.keys(localStorage);
    } catch (error) {
      // Error tracked;
      return Object.keys(this.memoryStore);
    }
  }

  // In-memory fallback storage
  static memoryStore = {};

  static setInMemory(key, value) {
    try {
      this.memoryStore[key] = value;
      return true;
    } catch (error) {
      // Error tracked;
      return false;
    }
  }

  static getInMemory(key, defaultValue = null) {
    return this.memoryStore[key] ?? defaultValue;
  }

  static removeInMemory(key) {
    delete this.memoryStore[key];
    return true;
  }

  static clearMemory() {
    this.memoryStore = {};
  }
}

// Export as singleton
export default LocalStorageManager;
