
/**
 * Authentication API
 * Handles login, register, password reset, email verification
 */
import axiosInstance from './axiosConfig';

console.log('🔧 authApi.js - Using axiosInstance with baseURL:', axiosInstance.defaults.baseURL);

export const authAPI = {
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  register: (userData) => axiosInstance.post('/api/auth/register', userData),
  logout: () => axiosInstance.post('/api/auth/logout'),
  getProfile: () => axiosInstance.get('/api/profile'),
  updateProfile: (data) => axiosInstance.put('/api/profile', data),
  requestPasswordReset: (data) => axiosInstance.post('/api/auth/request-password-reset', data),
  verifyResetToken: (data) => axiosInstance.post('/api/auth/verify-reset-token', data),
  resetPassword: (data) => axiosInstance.post('/api/auth/reset-password', data),
  verifyEmail: (data) => axiosInstance.post('/api/auth/verify-email', data),
  resendVerificationEmail: (data) => axiosInstance.post('/api/auth/resend-verification', data),
  getActivity: () => axiosInstance.get('/api/auth/activity'),

  // Buyer preferences
  updateBuyerPreferences: (data) => axiosInstance.put('/api/profile/buyer/preferences', data),
  getBuyerPreferences: () => axiosInstance.get('/api/profile/buyer/preferences'),

  // Supplier preferences
  updateSupplierPreferences: (data) => axiosInstance.put('/api/profile/supplier/preferences', data),
  getSupplierPreferences: () => axiosInstance.get('/api/profile/supplier/preferences'),
};
