
import axios from 'axios';
import tokenManager from './services/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// إنشاء نسخة axios مع الإعدادات الأساسية
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة interceptor للتوكن
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// إضافة interceptor للاستجابة
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    tokenManager.clearToken();
    return { success: true };
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password-reset/request', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/password-reset/reset', { token, newPassword });
    return response.data;
  },
};

// ==================== PROCUREMENT API ====================
export const procurementAPI = {
  // Tenders
  getTenders: async (params = {}) => {
    const response = await apiClient.get('/procurement/tenders', { params });
    return response.data;
  },

  getTenderById: async (id) => {
    const response = await apiClient.get(`/procurement/tenders/${id}`);
    return response.data;
  },

  createTender: async (tenderData) => {
    const response = await apiClient.post('/procurement/tenders', tenderData);
    return response.data;
  },

  updateTender: async (id, tenderData) => {
    const response = await apiClient.put(`/procurement/tenders/${id}`, tenderData);
    return response.data;
  },

  deleteTender: async (id) => {
    const response = await apiClient.delete(`/procurement/tenders/${id}`);
    return response.data;
  },

  // Offers
  getOffers: async (tenderId) => {
    const response = await apiClient.get(`/procurement/tenders/${tenderId}/offers`);
    return response.data;
  },

  createOffer: async (tenderId, offerData) => {
    const response = await apiClient.post(`/procurement/tenders/${tenderId}/offers`, offerData);
    return response.data;
  },

  updateOffer: async (offerId, offerData) => {
    const response = await apiClient.put(`/procurement/offers/${offerId}`, offerData);
    return response.data;
  },

  getMyOffers: async () => {
    const response = await apiClient.get('/procurement/my-offers');
    return response.data;
  },
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getStatistics: async () => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// ==================== NOTIFICATIONS API ====================
export const notificationAPI = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  },
};

// ==================== SEARCH API ====================
export const searchAPI = {
  searchTenders: async (query) => {
    const response = await apiClient.get('/search/tenders', { params: { q: query } });
    return response.data;
  },

  advancedSearch: async (filters) => {
    const response = await apiClient.post('/search/advanced', filters);
    return response.data;
  },
};

// Export default instance
export default apiClient;
