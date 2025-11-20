import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
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
