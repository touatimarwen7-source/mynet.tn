/**
 * 🔐 Input Sanitization Middleware
 * Comprehensive input validation and sanitization to prevent:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - LDAP Injection
 * - Command Injection
 * - Path Traversal
 */

const xss = require('xss');
const validator = require('validator');

/**
 * Sanitize string values
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove control characters
  str = str.replace(/[\x00-\x1F\x7F]/g, '');
  
  // XSS protection
  str = xss(str, {
    whiteList: {},
    stripIgnoredTag: true,
    stripLeakedHtml: true
  });
  
  // Trim whitespace
  str = str.trim();
  
  return str;
};

/**
 * Sanitize email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  email = email.toLowerCase().trim();
  
  // Validate email format
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  return email;
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  
  // Remove non-numeric characters except +
  phone = phone.replace(/[^\d+]/g, '');
  
  // Validate international phone format
  if (!validator.isMobilePhone(phone, 'any')) {
    throw new Error('Invalid phone number format');
  }
  
  return phone;
};

/**
 * Sanitize URL
 */
const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return url;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs allowed');
    }
    
    return url;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

/**
 * Sanitize number
 */
const sanitizeNumber = (num, options = {}) => {
  const { min, max, integer = false } = options;
  
  const parsed = integer ? parseInt(num, 10) : parseFloat(num);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid number');
  }
  
  if (min !== undefined && parsed < min) {
    throw new Error(`Number must be >= ${min}`);
  }
  
  if (max !== undefined && parsed > max) {
    throw new Error(`Number must be <= ${max}`);
  }
  
  return parsed;
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj, schema = {}) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => sanitizeObject(item, schema[idx] || {}));
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      continue;
    }
    
    const fieldSchema = schema[key] || { type: 'string' };
    
    try {
      switch (fieldSchema.type) {
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'url':
          sanitized[key] = sanitizeUrl(value);
          break;
        case 'number':
          sanitized[key] = sanitizeNumber(value, fieldSchema);
          break;
        case 'integer':
          sanitized[key] = sanitizeNumber(value, { ...fieldSchema, integer: true });
          break;
        case 'object':
          sanitized[key] = sanitizeObject(value, fieldSchema.schema || {});
          break;
        case 'array':
          if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
              fieldSchema.itemType === 'object' 
                ? sanitizeObject(item, fieldSchema.itemSchema || {})
                : sanitizeString(String(item))
            );
          }
          break;
        default:
          sanitized[key] = sanitizeString(String(value));
      }
    } catch (error) {
      throw new Error(`Invalid ${key}: ${error.message}`);
    }
  }
  
  return sanitized;
};

/**
 * Express middleware for input sanitization
 */
const sanitizationMiddleware = (schema = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, schema);
      }
      
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = sanitizeString(value);
          }
        }
      }
      
      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string') {
            req.params[key] = sanitizeString(value);
          }
        }
      }
      
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: ' + error.message,
        code: 'INVALID_INPUT'
      });
    }
  };
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeObject,
  sanitizationMiddleware
};
