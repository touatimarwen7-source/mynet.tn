/**
 * ⚡ PERFORMANCE OPTIMIZATIONS
 * Collection of utilities for better performance
 */

/**
 * Debounce function - reduces function calls during rapid events
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limits function calls to once per interval
 */
export const throttle = (func, interval) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      func(...args);
      lastCall = now;
    }
  };
};

/**
 * Memoize component props comparison
 */
export const arePropsSame = (prevProps, nextProps) => {
  const keys = Object.keys(nextProps);
  if (keys.length !== Object.keys(prevProps).length) return false;
  
  for (let key of keys) {
    if (prevProps[key] !== nextProps[key]) return false;
  }
  return true;
};

/**
 * Image lazy loading utilities
 */
export const createImageIntersectionObserver = (element, callback) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(element);
    return observer;
  }
};

/**
 * Request animation frame utilities
 */
export const requestIdleCallback = (callback) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  }
  // Fallback: setTimeout
  return setTimeout(callback, 0);
};

export default {
  debounce,
  throttle,
  arePropsSame,
  createImageIntersectionObserver,
  requestIdleCallback
};
