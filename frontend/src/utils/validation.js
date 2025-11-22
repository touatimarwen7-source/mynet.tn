/**
 * Input Validation Utilities
 * - Manual validation functions
 * - Zod schema validation for forms
 */

import { z } from 'zod';

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

// ============================================
// Zod Schema Definitions
// ============================================

export const LoginSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .min(1, 'البريد الإلكتروني مطلوب'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم')
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف'),
  confirmPassword: z.string(),
  companyName: z
    .string()
    .min(2, 'اسم الشركة مطلوب'),
  role: z.enum(['buyer', 'supplier'])
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword']
});

export const TenderSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  budget: z.number().positive(),
  deadline: z.string(),
  category: z.string().min(1)
});

/**
 * Validate data with Zod schema
 * Returns { success, data, errors }
 */
export const validateWithZod = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: error.message } };
  }
};

export default validation;
