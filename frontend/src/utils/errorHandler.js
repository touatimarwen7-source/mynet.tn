/**
 * @file errorHandler.js
 * @description A centralized utility for handling and formatting errors throughout the application.
 * This module provides consistent error messages, handles authentication errors,
 * and offers utilities for logging and retrying failed requests.
 */

/**
 * @module errorHandler
 * @description Provides a comprehensive set of functions for robust error management.
 * Comprehensive error handling with error codes, logging, and user notifications
 *
 * Features:
 * - Centralized error formatting (error codes + messages)
 * - Authentication error handling
 * - Validation error formatting
 * - Retry logic for transient failures
 * - Development logging
 * - Error tracking integration (ready for production)
 */

// import TokenManager from '../services/tokenManager'; // This import is removed as it's not used in the new handler
import { ERROR_CODES } from './errorCodes'; // This import is used for error codes

/**
 * Error Handler Utility - معالجة الأخطاء الموحدة
 */

/**
 * تنسيق رسائل الخطأ للمستخدم
 */
export const errorHandler = {
  /**
   * الحصول على رسالة خطأ مناسبة للمستخدم
   */
  getUserMessage(error) {
    // خطأ من الخادم
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // رسائل حسب كود الحالة
      switch (status) {
        case 400:
          return {
            title: 'خطأ في البيانات المدخلة',
            message: data?.message || 'يرجى التحقق من البيانات المدخلة',
            code: ERROR_CODES.VALIDATION_ERROR
          };

        case 401:
          return {
            title: 'غير مصرح',
            message: 'يرجى تسجيل الدخول مرة أخرى',
            code: ERROR_CODES.UNAUTHORIZED
          };

        case 403:
          return {
            title: 'ممنوع',
            message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
            code: ERROR_CODES.FORBIDDEN
          };

        case 404:
          return {
            title: 'غير موجود',
            message: data?.message || 'المورد المطلوب غير موجود',
            code: ERROR_CODES.NOT_FOUND
          };

        case 409:
          return {
            title: 'تعارض',
            message: data?.message || 'يوجد تعارض مع البيانات الحالية',
            code: ERROR_CODES.CONFLICT
          };

        case 429:
          return {
            title: 'طلبات كثيرة',
            message: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً',
            code: ERROR_CODES.RATE_LIMIT
          };

        case 500:
        case 502:
        case 503:
          return {
            title: 'خطأ في الخادم',
            message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
            code: ERROR_CODES.SERVER_ERROR
          };

        default:
          return {
            title: 'خطأ',
            message: data?.message || 'حدث خطأ غير متوقع',
            code: ERROR_CODES.UNKNOWN_ERROR
          };
      }
    }

    // خطأ في الطلب
    if (error.request) {
      return {
        title: 'خطأ في الاتصال',
        message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت',
        code: ERROR_CODES.NETWORK_ERROR
      };
    }

    // خطأ آخر
    return {
      title: 'خطأ',
      message: error.message || 'حدث خطأ غير متوقع',
      code: ERROR_CODES.UNKNOWN_ERROR
    };
  },

  /**
   * تسجيل الخطأ (للتطوير)
   */
  logError(error, context = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Error Details');
      console.error('Error:', error);
      console.log('Context:', context);
      console.groupEnd();
    }
  },

  /**
   * معالجة خطأ API
   */
  handleApiError(error, showToast = null) {
    const formatted = this.getUserMessage(error);
    this.logError(error, formatted);

    // عرض Toast إذا كان متاحاً
    if (showToast && typeof showToast === 'function') {
      showToast(formatted.message, 'error');
    }

    return formatted;
  }
};

export default errorHandler;