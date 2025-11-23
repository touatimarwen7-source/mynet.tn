/**
 * 📋 useFormValidation Hook
 * Comprehensive form validation with real-time error display
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Validate a single field against rules
 */
const validateField = (value, rules, allValues = {}) => {
  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message;
    }

    // Skip further validation if empty and not required
    if (!value && !rule.required) {
      continue;
    }

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return rule.message;
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message;
    }

    // Pattern validation (regex)
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message;
    }

    // Match validation (confirm password, etc)
    if (rule.match && allValues[rule.match] !== value) {
      return rule.message;
    }

    // Custom validation function
    if (rule.custom && typeof rule.custom === 'function') {
      try {
        if (!rule.custom(value, allValues)) {
          return rule.message;
        }
      } catch (err) {
        return rule.message;
      }
    }
  }

  return null; // No errors
};

/**
 * useFormValidation Hook
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Schema with validation rules
 * @param {Function} onSubmit - Submit callback
 * @returns {Object} Form state and methods
 */
export const useFormValidation = (initialValues = {}, validationSchema = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Validate single field
   */
  const validateSingleField = useCallback((name, value) => {
    const rules = validationSchema[name];
    if (!rules) return null;

    const error = validateField(value, rules, values);
    return error;
  }, [validationSchema, values]);

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(values[fieldName], validationSchema[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [validationSchema, values]);

  /**
   * Handle field change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    setIsDirty(true);

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateSingleField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateSingleField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateSingleField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateSingleField]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const isValid = validateAllFields();

    if (!isValid) {
      // Mark all fields as touched
      const allTouched = {};
      Object.keys(validationSchema).forEach(fieldName => {
        allTouched[fieldName] = true;
      });
      setTouched(allTouched);
      return;
    }

    // All valid, submit
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        // Error tracked;
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateAllFields, validationSchema, values, onSubmit]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = Object.keys(errors).length === 0 && isDirty;

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,

    // Methods
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateSingleField,
    validateAllFields,

    // Getters for TextField integration
    getFieldProps: (name) => ({
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && !!errors[name],
      helperText: touched[name] ? errors[name] : ''
    })
  };
};

export default useFormValidation;
