import axios from 'axios';

// API Base URL - connects to backend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track if refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Add access token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 errors and refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          // Retry the original request
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};

export const procurementAPI = {
  getTenders: (filters) => api.get('/procurement/tenders', { params: filters }),
  getTender: (id) => api.get(`/procurement/tenders/${id}`),
  createTender: (data) => api.post('/procurement/tenders', data),
  updateTender: (id, data) => api.put(`/procurement/tenders/${id}`, data),
  deleteTender: (id) => api.delete(`/procurement/tenders/${id}`),
  publishTender: (id) => api.post(`/procurement/tenders/${id}/publish`),
  closeTender: (id) => api.post(`/procurement/tenders/${id}/close`),
  getMyTenders: (filters) => api.get('/procurement/my-tenders', { params: filters }),
  
  getOffers: (tenderId) => api.get(`/procurement/tenders/${tenderId}/offers`),
  getMyOffers: () => api.get('/procurement/my-offers'),
  createOffer: (data) => api.post('/procurement/offers', data),
  evaluateOffer: (id, data) => api.post(`/procurement/offers/${id}/evaluate`, data),
  selectWinner: (id) => api.post(`/procurement/offers/${id}/select-winner`),
  rejectOffer: (id) => api.post(`/procurement/offers/${id}/reject`)
};

export const searchAPI = {
  searchTenders: (params) => api.get('/search/tenders', { params }),
  searchSuppliers: (params) => api.get('/search/suppliers', { params })
};

export const adminAPI = {
  getUsers: (filters) => api.get('/admin/users', { params: filters }),
  getStatistics: () => api.get('/admin/statistics'),
  verifyUser: (id) => api.post(`/admin/users/${id}/verify`),
  toggleUserStatus: (id, data) => api.put(`/admin/users/${id}/toggle-status`, data)
};

export default api;
