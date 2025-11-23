/**
 * 🛡️ COMPREHENSIVE INPUT VALIDATION MIDDLEWARE
 * Prevents SQL injection, XSS, and other input-based attacks
 * Validates and sanitizes all user input
 */

const MAX_STRING_LENGTH = 10000;
const MAX_ID_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_URL_LENGTH = 2048;
const MAX_NUMBER_VALUE = 999999999;
const MIN_NUMBER_VALUE = -999999999;

/**
 * VALIDATORS - Pure functions that check input validity
 */
const validators = {
  // Email validation
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    if (email.length > MAX_EMAIL_LENGTH) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (international format)
  isValidPhone: (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    if (phone.length > MAX_PHONE_LENGTH) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  },

  // Positive integer validation
  isValidPositiveNumber: (n) => {
    if (typeof n !== 'number' && typeof n !== 'string') return false;
    const num = Number(n);
    return Number.isFinite(num) && num > 0 && num <= MAX_NUMBER_VALUE && Number.isInteger(num);
  },

  // Positive decimal validation
  isValidDecimal: (n, min = 0, max = MAX_NUMBER_VALUE) => {
    if (typeof n !== 'number' && typeof n !== 'string') return false;
    const num = Number(n);
    return Number.isFinite(num) && num >= min && num <= max;
  },

  // Rating validation (1-5)
  isValidRating: (rating) => {
    const r = Number(rating);
    return Number.isInteger(r) && r >= 1 && r <= 5;
  },

  // ID validation (UUID or numeric ID)
  isValidId: (id) => {
    if (!id || typeof id !== 'string') return false;
    if (id.length > MAX_ID_LENGTH) return false;
    // Numeric ID or UUID format
    const idRegex = /^[0-9a-f\-]{8,36}$|^[0-9]+$/i;
    return idRegex.test(id);
  },

  // Generic string validation
  isValidString: (str, minLength = 1, maxLength = MAX_STRING_LENGTH) => {
    if (typeof str !== 'string') return false;
    if (str.length < minLength || str.length > maxLength) return false;
    return true;
  },

  // Boolean validation
  isValidBoolean: (value) => {
    return value === true || value === false || value === 'true' || value === 'false' || value === '1' || value === '0';
  },

  // URL validation
  isValidUrl: (url) => {
    if (typeof url !== 'string') return false;
    if (url.length > MAX_URL_LENGTH) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Date validation
  isValidDate: (date) => {
    if (typeof date === 'string') {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    }
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    return false;
  },

  // Enum validation
  isValidEnum: (value, allowedValues) => {
    if (!Array.isArray(allowedValues)) return false;
    return allowedValues.includes(value);
  },

  // Array validation
  isValidArray: (arr, minLength = 0, maxLength = 10000) => {
    if (!Array.isArray(arr)) return false;
    if (arr.length < minLength || arr.length > maxLength) return false;
    return true;
  },

  // Currency amount validation (handles decimals)
  isValidAmount: (amount, maxAmount = 999999999.99) => {
    if (typeof amount !== 'number' && typeof amount !== 'string') return false;
    const num = Number(amount);
    return Number.isFinite(num) && num >= 0 && num <= maxAmount;
  },

  // Percentage validation (0-100)
  isValidPercentage: (value) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num <= 100;
  },
};

/**
 * SANITIZERS - Pure functions that clean/escape input
 */
const sanitizers = {
  // Escape HTML special characters
  escapeHtml: (str) => {
    if (typeof str !== 'string') return str;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return str.replace(/[&<>"'/]/g, char => map[char]);
  },

  // Trim and truncate string
  sanitizeString: (str, maxLength = MAX_STRING_LENGTH) => {
    if (typeof str !== 'string') return str;
    return str.trim().substring(0, maxLength);
  },

  // Remove SQL injection patterns
  removeSqlPatterns: (str) => {
    if (typeof str !== 'string') return str;
    // This is NOT a complete SQL injection prevention - always use parameterized queries
    // This is just an extra layer of defense
    const dangerousPatterns = [
      /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/gi,
      /--|#|\/\*/,
      /;/,
      /xp_/i,
      /sp_/i,
    ];
    let sanitized = str;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    return sanitized;
  },

  // Convert string to valid boolean
  parseBoolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return !!value;
  },

  // Normalize email
  normalizeEmail: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  },

  // Safe integer conversion
  toSafeInt: (value) => {
    const num = parseInt(value, 10);
    if (!Number.isFinite(num)) return null;
    if (num < MIN_NUMBER_VALUE || num > MAX_NUMBER_VALUE) return null;
    return num;
  },

  // Safe float conversion
  toSafeFloat: (value) => {
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return null;
    if (num < MIN_NUMBER_VALUE || num > MAX_NUMBER_VALUE) return null;
    return num;
  },
};

/**
 * EXPRESS MIDDLEWARE - Validates all incoming requests
 */
const validationMiddleware = (req, res, next) => {
  // Validate and sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Validate and sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Validate and sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  // Attach validators and sanitizers to request for use in controllers
  req.validators = validators;
  req.sanitizers = sanitizers;

  // Log suspicious patterns (for security monitoring)
  const allInput = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (containsSuspiciousPatterns(allInput)) {
    // Warning tracking removed;
    // Warning tracking removed;
    // Don't block - let controller handle validation
    // But we're alerted to potential attack
  }

  next();
};

/**
 * Helper: Sanitize entire object recursively
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return obj; // Prevent infinite recursion
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Sanitize string values: trim and escape dangerous characters
      sanitized[key] = sanitizers.sanitizeString(sanitizers.escapeHtml(value));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Helper: Detect suspicious SQL/XSS patterns
 */
function containsSuspiciousPatterns(input) {
  const suspiciousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /--|#|\/\*/,
    /xp_|sp_/i,
    /<script|javascript:|onerror=|onload=/i,
  ];
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * SPECIFIC VALIDATORS - For use in controllers
 * Examples: req.validators.isValidEmail(email)
 */

/**
 * BATCH VALIDATION HELPER
 * Validates multiple fields at once
 * Usage: validateFields(req.body, { email: 'email', rating: 'rating' })
 */
function validateFields(data, schema) {
  const errors = {};

  for (const [field, type] of Object.entries(schema)) {
    const value = data[field];

    if (value === undefined || value === null) {
      errors[field] = `${field} is required`;
      continue;
    }

    let isValid = false;
    switch (type) {
      case 'email':
        isValid = validators.isValidEmail(value);
        break;
      case 'phone':
        isValid = validators.isValidPhone(value);
        break;
      case 'string':
        isValid = validators.isValidString(value);
        break;
      case 'id':
        isValid = validators.isValidId(value);
        break;
      case 'number':
        isValid = validators.isValidPositiveNumber(value);
        break;
      case 'decimal':
        isValid = validators.isValidDecimal(value);
        break;
      case 'boolean':
        isValid = validators.isValidBoolean(value);
        break;
      case 'date':
        isValid = validators.isValidDate(value);
        break;
      case 'url':
        isValid = validators.isValidUrl(value);
        break;
      case 'rating':
        isValid = validators.isValidRating(value);
        break;
      case 'array':
        isValid = validators.isValidArray(value);
        break;
      case 'amount':
        isValid = validators.isValidAmount(value);
        break;
      case 'percentage':
        isValid = validators.isValidPercentage(value);
        break;
      default:
        errors[field] = `Unknown validation type: ${type}`;
    }

    if (!isValid) {
      errors[field] = `${field} has invalid ${type} format`;
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
}

module.exports = {
  validators,
  sanitizers,
  validationMiddleware,
  validateFields,
  MAX_STRING_LENGTH,
  MAX_ID_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_URL_LENGTH,
};
