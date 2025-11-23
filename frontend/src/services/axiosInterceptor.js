/**
 * 📨 AXIOS RESPONSE INTERCEPTOR
 * Automatically validates all API responses
 */

import ResponseValidator from '../utils/responseValidator';

export const setupResponseValidation = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      try {
        // Validate successful responses
        if (response.data.success) {
          ResponseValidator.validateResponse(response.data);
        }
        return response;
      } catch (error) {
        // Error tracked;
        throw error;
      }
    },
    (error) => {
      try {
        // Validate error responses
        const validatedError = ResponseValidator.validateErrorResponse(error);
        // Error tracked;
        return Promise.reject(error);
      } catch (e) {
        return Promise.reject(error);
      }
    }
  );
};

export default setupResponseValidation;
