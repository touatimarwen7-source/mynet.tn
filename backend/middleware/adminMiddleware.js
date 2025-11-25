/**
 * 🔐 ADMIN MIDDLEWARE SUITE
 * Comprehensive middleware for admin operations
 * 
 * Features:
 * - Admin-specific rate limiting
 * - Permission validation
 * - Input sanitization
 * - File upload validation
 * - Admin action logging
 * - Sensitive data protection
 */

const rateLimit = require('express-rate-limit');

// ===== 1. ADMIN RATE LIMITING =====
/**
 * Stricter rate limiting for admin operations
 * - General admin: 50 requests per 15 min
 * - Admin mutations (POST/PUT/DELETE): 20 per 15 min
 * - Admin file operations: 10 per 15 min
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many admin requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role !== 'super_admin'
});

const adminMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many admin modifications, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role !== 'super_admin' || req.method === 'GET'
});

const adminFileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'File upload limit reached, try again later',
  standardHeaders: true,
  skip: (req) => req.user?.role !== 'super_admin'
});

// ===== 2. INPUT VALIDATION MIDDLEWARE =====
/**
 * Validate and sanitize admin input
 */
const validateAdminInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      // Remove dangerous characters
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        
        // String sanitization
        if (typeof value === 'string') {
          // Remove HTML/script tags
          req.body[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
          
          // Remove SQL injection attempts
          req.body[key] = req.body[key]
            .replace(/['";\\]/g, '')
            .substring(0, 5000); // Max length
        }
      });
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: 'Invalid input format' 
    });
  }
};

// ===== 3. FILE UPLOAD VALIDATION =====
/**
 * Validate file uploads for admin operations
 */
const validateFileUpload = (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // File size validation (50MB max)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size: 50MB'
      });
    }

    // Allowed file types
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(415).json({
        success: false,
        error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`
      });
    }

    // Filename validation
    const UNSAFE_FILENAME_CHARS = /[<>:"|?*\x00-\x1f]/g;
    if (UNSAFE_FILENAME_CHARS.test(req.file.originalname)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'File validation error'
    });
  }
};

// ===== 4. ADMIN PERMISSION VALIDATOR =====
/**
 * Verify admin has specific permission for resource
 */
const verifyAdminPermission = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      // Check specific permissions if provided
      if (requiredPermissions.length > 0) {
        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.some(perm => 
          userPermissions.includes(perm)
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions for this operation'
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Permission verification failed'
      });
    }
  };
};

// ===== 5. SENSITIVE DATA PROTECTION =====
/**
 * Prevent sensitive data exposure in responses
 */
const protectSensitiveData = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Remove sensitive fields from response
    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'refreshTokenId',
      'apiKey',
      'secret',
      'ssn',
      'bankAccount'
    ];

    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const sanitized = { ...obj };
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          delete sanitized[field];
        }
      });

      return sanitized;
    };

    const sanitizedData = sanitizeObject(data);
    return originalJson.call(this, sanitizedData);
  };

  next();
};

// ===== 6. ADMIN ACTION LOGGING =====
/**
 * Log admin actions for audit trail
 */
const logAdminAction = async (req, res, next) => {
  try {
    // Capture original response
    const originalSend = res.send;
    let responseData;

    res.send = function(data) {
      responseData = data;
      return originalSend.call(this, data);
    };

    // Intercept response to log success/failure
    res.on('finish', async () => {
      try {
        if (req.user && req.user.role === 'super_admin') {
          const action = `${req.method}_${req.path}`;
          const status = res.statusCode < 400 ? 'success' : 'failure';
          
          // Log details
          const logEntry = {
            userId: req.user.id,
            action: action,
            method: req.method,
            path: req.path,
            status: status,
            statusCode: res.statusCode,
            ipAddress: req.clientIP,
            userAgent: req.get('user-agent'),
            timestamp: new Date(),
            requestId: req.id
          };

          // Send to logging service (async, doesn't block response)
          // // Tracking removed;
        }
      } catch (err) {
        // Silent error - don't interfere with response
      }
    });

    next();
  } catch (error) {
    next();
  }
};

// ===== 7. QUERY PARAMETER VALIDATION =====
/**
 * Validate and sanitize query parameters
 */
const validateQueryParams = (req, res, next) => {
  try {
    const allowedParams = ['page', 'limit', 'search', 'filter', 'sort', 'action', 'status', 'user_id'];
    const queryKeys = Object.keys(req.query);

    // Check for suspicious parameters
    const suspiciousParams = queryKeys.filter(key => !allowedParams.includes(key));
    if (suspiciousParams.length > 0) {
      // Warning tracking removed;
    }

    // Validate pagination
    if (req.query.page) {
      req.query.page = Math.max(1, parseInt(req.query.page) || 1);
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit) || 10;
      req.query.limit = Math.min(Math.max(1, limit), 100); // 1-100
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid query parameters'
    });
  }
};

// ===== 8. CONCURRENT REQUEST LIMITER =====
/**
 * Limit concurrent admin operations per user
 */
const concurrentRequestLimiter = () => {
  const concurrentRequests = new Map();

  return (req, res, next) => {
    if (!req.user) return next();

    const userId = req.user.id;
    const currentCount = (concurrentRequests.get(userId) || 0);
    const MAX_CONCURRENT = 10;

    if (currentCount >= MAX_CONCURRENT) {
      return res.status(429).json({
        success: false,
        error: 'Too many concurrent requests, please wait'
      });
    }

    // Increment counter
    concurrentRequests.set(userId, currentCount + 1);

    // Decrement when response finishes
    res.on('finish', () => {
      const newCount = concurrentRequests.get(userId) - 1;
      if (newCount <= 0) {
        concurrentRequests.delete(userId);
      } else {
        concurrentRequests.set(userId, newCount);
      }
    });

    next();
  };
};

// ===== 9. REQUEST VALIDATION SCHEMA =====
/**
 * Validate request against schema
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      if (req.body && schema) {
        const requiredFields = Object.keys(schema);
        const missingFields = requiredFields.filter(field => 
          req.body[field] === undefined || req.body[field] === null
        );

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
        }

        // Validate field types
        Object.entries(schema).forEach(([field, type]) => {
          if (typeof req.body[field] !== type) {
            return res.status(400).json({
              success: false,
              error: `Field ${field} must be type ${type}`
            });
          }
        });
      }
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Schema validation failed'
      });
    }
  };
};

// ===== 10. ERROR RESPONSE HANDLER =====
/**
 * Standardize admin error responses
 */
const adminErrorHandler = (err, req, res, next) => {
  const errorResponse = {
    success: false,
    error: err.message || 'Internal server error',
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  // Log admin errors
  if (req.user?.role === 'super_admin') {
    // Emit admin error event if available
    const io = req.app.get('io');
    if (io) {
      io.to(`admin`).emit('admin-error', {
        ...errorResponse,
        path: req.path,
        method: req.method,
        userId: req.user.id,
        stack: err.stack
      });
    }
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(errorResponse);
};

// ===== EXPORTS =====
module.exports = {
  // Rate limiters
  adminLimiter,
  adminMutationLimiter,
  adminFileUploadLimiter,

  // Validation middleware
  validateAdminInput,
  validateFileUpload,
  validateQueryParams,
  validateSchema,

  // Permission & security
  verifyAdminPermission,
  protectSensitiveData,

  // Logging & monitoring
  logAdminAction,

  // Advanced limiters
  concurrentRequestLimiter,

  // Error handling
  adminErrorHandler
};
