/**
 * 🔒 FIELD-LEVEL ACCESS CONTROL
 * Hide sensitive fields based on user role and resource ownership
 */

/**
 * Define which fields are sensitive for each resource type
 */
const sensitiveFields = {
  user: {
    admin: ['password', 'passwordHash', 'refreshToken', 'apiKey', 'mfaSecret'],
    buyer: ['password', 'passwordHash', 'refreshToken', 'apiKey', 'mfaSecret', 'bankDetails'],
    supplier: ['password', 'passwordHash', 'refreshToken', 'apiKey', 'taxId']
  },
  tender: {
    admin: [],
    buyer: ['internalNotes', 'evaluationCriteria'],
    supplier: ['budget', 'internalNotes', 'evaluationCriteria', 'notes']
  },
  bid: {
    admin: [],
    buyer: [],
    supplier: ['companyFinancials', 'internalNotes']
  },
  invoice: {
    admin: [],
    buyer: ['paymentTerms'],
    supplier: []
  },
  company: {
    admin: [],
    buyer: ['bankDetails', 'taxId', 'ownerDetails'],
    supplier: []
  }
};

/**
 * Filter out sensitive fields from response
 */
function filterSensitiveFields(data, resourceType, userRole, isOwner = false) {
  if (!data) return data;

  // Admin sees everything
  if (userRole === 'admin' || userRole === 'super_admin') {
    return data;
  }

  const fieldsToRemove = sensitiveFields[resourceType]?.[userRole] || [];

  if (Array.isArray(data)) {
    return data.map(item => removeSensitiveFields(item, fieldsToRemove));
  }

  return removeSensitiveFields(data, fieldsToRemove);
}

/**
 * Helper to remove fields recursively
 */
function removeSensitiveFields(obj, fieldsToRemove) {
  if (!obj || typeof obj !== 'object') return obj;

  const filtered = { ...obj };
  fieldsToRemove.forEach(field => {
    delete filtered[field];
  });

  return filtered;
}

/**
 * Middleware to automatically filter response
 */
function fieldLevelAccessFilter(resourceType) {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      if (!data) return originalJson.call(this, data);

      const userRole = req.user?.role || 'guest';
      const isOwner = req.user?.id === data?.userId || req.user?.id === data?.supplierId;

      const filtered = filterSensitiveFields(data, resourceType, userRole, isOwner);

      return originalJson.call(this, filtered);
    };

    next();
  };
}

/**
 * Restrict write access to sensitive fields
 */
function restrictSensitiveFieldWrites(req, res, next) {
  const sensitiveWriteFields = [
    'password',
    'passwordHash',
    'refreshToken',
    'apiKey',
    'mfaSecret',
    'bankDetails',
    'taxId',
    'role', // Don't let users change their own role
    'status', // Don't let users change resource status
    'verified' // Don't let users mark themselves as verified
  ];

  // Check if any sensitive fields are being written
  const bodyKeys = Object.keys(req.body || {});
  const hasSensitiveWrite = bodyKeys.some(key => sensitiveWriteFields.includes(key));

  if (hasSensitiveWrite && req.user?.role !== 'super_admin') {
    const attemptedFields = bodyKeys.filter(key => sensitiveWriteFields.includes(key));
    return res.status(403).json({
      success: false,
      error: {
        message: 'Cannot modify sensitive fields',
        attemptedFields,
        statusCode: 403
      }
    });
  }

  next();
}

/**
 * Check field ownership before read
 */
function checkFieldOwnership(req, res, next) {
  const { resourceType, resourceId } = req.params;
  
  // This would typically check if the user owns the resource
  // Implementation depends on your database schema
  
  next();
}

/**
 * Log sensitive field access attempts
 */
function logSensitiveFieldAccess(req, res, next) {
  const sensitiveFields = ['password', 'apiKey', 'mfaSecret', 'bankDetails'];
  
  const bodyKeys = Object.keys(req.body || {});
  const accessedSensitive = bodyKeys.filter(key => sensitiveFields.includes(key));

  if (accessedSensitive.length > 0) {
    console.warn('[SENSITIVE FIELD ACCESS]', {
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      fields: accessedSensitive,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

module.exports = {
  filterSensitiveFields,
  fieldLevelAccessFilter,
  restrictSensitiveFieldWrites,
  checkFieldOwnership,
  logSensitiveFieldAccess,
  sensitiveFields
};
