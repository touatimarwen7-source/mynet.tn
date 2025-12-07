import axios from 'axios';
import tokenManager from './services/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          tokenManager.setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

// Procurement API
const procurementAPI = {
  getTenders: (params) => apiClient.get('/procurement/tenders', { params }),
  getTender: (id) => apiClient.get(`/procurement/tenders/${id}`),
  createTender: (data) => apiClient.post('/procurement/tenders', data),
  updateTender: (id, data) => apiClient.put(`/procurement/tenders/${id}`, data),
  deleteTender: (id) => apiClient.delete(`/procurement/tenders/${id}`),
  getMyTenders: () => apiClient.get('/procurement/my-tenders'),
  submitOffer: (tenderId, offerData) => apiClient.post(`/procurement/tenders/${tenderId}/offers`, offerData),
  getOffers: (tenderId) => apiClient.get(`/procurement/tenders/${tenderId}/offers`),
  getMyOffers: () => apiClient.get('/procurement/my-offers'),
};

// Admin API
const adminAPI = {
  getUsers: () => apiClient.get('/admin/users'),
  getUser: (id) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getStats: () => apiClient.get('/admin/stats'),
};

// Notification API
const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};

// Search API
const searchAPI = {
  search: (query, filters) => apiClient.get('/search', { params: { query, ...filters } }),
  advancedSearch: (criteria) => apiClient.post('/search/advanced', criteria),
};

// Export all APIs as named exports
export { authAPI, procurementAPI, adminAPI, notificationAPI, searchAPI };

// Export axios instance as default
export default apiClient;