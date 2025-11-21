// Input Validation Utilities

export const validation = {
  // Email validation
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 255;
  },

  // Phone validation (International format)
  isValidPhone: (phone) => {
    const regex = /^[\d\s+\-()]{7,}$/;
    return regex.test(phone.trim());
  },

  // Number validation
  isValidNumber: (value, min = 0, max = Infinity) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // String length validation
  isValidLength: (str, min = 1, max = 255) => {
    const trimmed = str.trim();
    return trimmed.length >= min && trimmed.length <= max;
  },

  // Date validation
  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // File validation
  isValidFile: (file, maxSizeMB = 10, allowedTypes = []) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (!file) return false;
    if (file.size > maxSize) return false;
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) return false;
    
    return true;
  },

  // Currency amount validation
  isValidAmount: (amount, maxAmount = 999999999) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= maxAmount;
  },

  // Sanitize string (XSS prevention)
  sanitizeString: (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  },

  // Validate form data
  validateFormData: (data, schema) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      if (rules.required && !value) {
        errors[field] = `${field} est requis`;
        continue;
      }
      
      if (rules.minLength && value?.length < rules.minLength) {
        errors[field] = `${field} doit contenir au moins ${rules.minLength} caractères`;
        continue;
      }
      
      if (rules.maxLength && value?.length > rules.maxLength) {
        errors[field] = `${field} ne peut pas dépasser ${rules.maxLength} caractères`;
        continue;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} est invalide`;
        continue;
      }
      
      if (rules.custom && !rules.custom(value)) {
        errors[field] = rules.message || `${field} est invalide`;
      }
    }
    
    return errors;
  }
};

export default validation;
