/**
 * Service Validation Wrapper
 * Ensures all service methods validate inputs
 */

const Joi = require('joi');
const { ErrorResponseFormatter } = require('./errorHandler');

class ServiceValidator {
  /**
   * Validate required fields
   */
  static validateRequired(data, fields) {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Validate numeric ID
   */
  static validateId(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      throw error;
    }
    return numId;
  }

  /**
   * Validate UUID format
   */
  static validateUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      const error = new Error('Invalid UUID format');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Validate with Joi schema
   */
  static validateWithSchema(data, schema) {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.details = details;
      throw err;
    }
    return value;
  }

  /**
   * Wrap service method with validation
   */
  static wrapMethod(method, validator) {
    return async function (...args) {
      try {
        if (validator) {
          await validator(...args);
        }
        return await method.apply(this, args);
      } catch (error) {
        error.statusCode = error.statusCode || 500;
        throw error;
      }
    };
  }

  /**
   * Validate pagination params
   */
  static validatePagination(page, limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    if (pageNum < 1) {
      const error = new Error('Page must be >= 1');
      error.statusCode = 400;
      throw error;
    }

    if (limitNum < 1 || limitNum > 100) {
      const error = new Error('Limit must be between 1 and 100');
      error.statusCode = 400;
      throw error;
    }

    return { page: pageNum, limit: limitNum };
  }

  /**
   * Validate enum values
   */
  static validateEnum(value, allowedValues, fieldName = 'field') {
    if (!allowedValues.includes(value)) {
      const error = new Error(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Validate string length
   */
  static validateStringLength(value, minLength, maxLength, fieldName = 'field') {
    if (value.length < minLength || value.length > maxLength) {
      const error = new Error(
        `${fieldName} must be between ${minLength} and ${maxLength} characters`
      );
      error.statusCode = 400;
      throw error;
    }
  }
}

module.exports = ServiceValidator;
