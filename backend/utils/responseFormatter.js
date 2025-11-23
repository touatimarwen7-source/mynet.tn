/**
 * 📋 RESPONSE FORMATTER
 * Standardizes API response format across all endpoints
 * Reduces response size and improves consistency
 */

class ResponseFormatter {
  /**
   * Format success response
   */
  static success(data, message = 'Success', meta = null) {
    return {
      success: true,
      message,
      data,
      ...(meta && { meta })
    };
  }

  /**
   * Format error response
   */
  static error(message = 'Error', code = 'ERROR', statusCode = 500) {
    return {
      success: false,
      error: {
        message,
        code,
        timestamp: new Date().toISOString()
      },
      statusCode
    };
  }

  /**
   * Format paginated response
   */
  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  /**
   * Clean null/undefined values
   */
  static clean(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.clean(item));
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = this.clean(value);
      }
    }
    return cleaned;
  }
}

module.exports = ResponseFormatter;
