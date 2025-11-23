/**
 * ✅ PARAMETER VALIDATOR
 * Reusable parameter validation logic
 */

class ParamValidator {
  /**
   * Validate required parameters
   */
  static validateRequired(params, required) {
    const missing = [];
    required.forEach(param => {
      if (!params[param]) {
        missing.push(param);
      }
    });
    return missing.length === 0 ? null : missing;
  }

  /**
   * Validate integer parameter
   */
  static validateInteger(value, fieldName = 'value') {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a positive integer`;
    }
    return null;
  }

  /**
   * Validate UUID parameter
   */
  static validateUUID(value, fieldName = 'id') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return `${fieldName} must be a valid UUID`;
    }
    return null;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page, limit) {
    const errors = [];
    
    const pageNum = parseInt(page) || 1;
    if (pageNum < 1) errors.push('Page must be >= 1');

    const limitNum = parseInt(limit) || 10;
    if (limitNum < 1 || limitNum > 100) errors.push('Limit must be between 1 and 100');

    return errors.length === 0 ? null : errors;
  }

  /**
   * Validate status parameter
   */
  static validateStatus(status, validStatuses) {
    if (!validStatuses.includes(status)) {
      return `Status must be one of: ${validStatuses.join(', ')}`;
    }
    return null;
  }
}

module.exports = ParamValidator;
