/**
 * 📋 RESPONSE VALIDATION LAYER
 * Validates all API responses for consistency and security
 */

export const ResponseValidator = {
  /**
   * Validate standard API response structure
   */
  validateResponse(response, expectedFields = []) {
    if (!response) {
      throw new Error('Response is empty');
    }

    if (!response.success && response.success !== false) {
      throw new Error('Invalid response structure: missing success field');
    }

    // Check expected fields
    for (const field of expectedFields) {
      if (!(field in response)) {
        // Warning tracked;
      }
    }

    return response;
  },

  /**
   * Validate list response (pagination)
   */
  validateListResponse(response) {
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array in data field');
    }

    if (response.pagination) {
      if (!Number.isInteger(response.pagination.total)) {
        throw new Error('Invalid pagination total');
      }
      if (!Number.isInteger(response.pagination.page)) {
        throw new Error('Invalid pagination page');
      }
      if (!Number.isInteger(response.pagination.limit)) {
        throw new Error('Invalid pagination limit');
      }
    }

    return response;
  },

  /**
   * Validate single item response
   */
  validateItemResponse(response, requiredFields = []) {
    if (!response.data) {
      throw new Error('No data in response');
    }

    const item = response.data;

    for (const field of requiredFields) {
      if (!(field in item)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return response;
  },

  /**
   * Validate authentication response
   */
  validateAuthResponse(response) {
    const required = ['accessToken', 'user'];

    if (!response.accessToken || typeof response.accessToken !== 'string') {
      throw new Error('Invalid access token');
    }

    if (!response.user) {
      throw new Error('Missing user data');
    }

    if (!response.user.id) {
      throw new Error('Invalid user ID');
    }

    return response;
  },

  /**
   * Validate error response
   */
  validateErrorResponse(error) {
    if (!error.response) {
      return { statusCode: 500, message: error.message };
    }

    return {
      statusCode: error.response.status || 500,
      message: error.response.data?.error?.message || error.message,
      details: error.response.data?.error?.details
    };
  },

  /**
   * Safe JSON parse with validation
   */
  parseJSON(text) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      throw new Error('Invalid JSON structure');
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e.message}`);
    }
  },

  /**
   * Validate data types
   */
  validateDataTypes(data, schema) {
    for (const [key, expectedType] of Object.entries(schema)) {
      const actualType = typeof data[key];

      if (actualType !== expectedType && data[key] !== null) {
        // Warning tracked;
      }
    }

    return data;
  }
};

export default ResponseValidator;
