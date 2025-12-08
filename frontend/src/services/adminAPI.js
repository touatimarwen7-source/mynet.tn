
import axiosInstance from './axiosConfig';

const adminAPI = {
  // Dashboard & Statistics
  dashboard: {
    get: () => axiosInstance.get('/admin/dashboard'),
    getHealth: () => axiosInstance.get('/admin/health'),
    getAnalytics: () => axiosInstance.get('/admin/analytics'),
  },

  // Users
  users: {
    getAll: (page = 1, limit = 10, search = '') => 
      axiosInstance.get('/admin/users', { params: { page, limit, search } }),
    getById: (id) => axiosInstance.get(`/admin/users/${id}`),
    updateRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }),
    toggleBlock: (id, blocked) => axiosInstance.post(`/admin/users/${id}/${blocked ? 'block' : 'unblock'}`),
    resetPassword: (id) => axiosInstance.post(`/admin/users/${id}/reset-password`),
    delete: (id) => axiosInstance.delete(`/admin/users/${id}`),
  },

  // Analytics
  analytics: {
    getStats: () => axiosInstance.get('/admin/analytics'),
    getActivities: (params = {}) => axiosInstance.get('/admin/activities/recent', { params }),
    getUserStats: () => axiosInstance.get('/admin/analytics/users'),
    exportLogs: (format = 'json', startDate, endDate) => 
      axiosInstance.get('/admin/audit-logs/export', { 
        params: { format, startDate, endDate },
        responseType: format === 'csv' ? 'blob' : 'json'
      }),
  },

  // Content
  content: {
    getPages: () => axiosInstance.get('/admin/content/pages'),
    createPage: (data) => axiosInstance.post('/admin/content/pages', data),
    updatePage: (id, data) => axiosInstance.put(`/admin/content/pages/${id}`, data),
    deletePage: (id) => axiosInstance.delete(`/admin/content/pages/${id}`),
  },

  // Configuration
  config: {
    getAll: () => axiosInstance.get('/admin/config'),
    update: (data) => axiosInstance.put('/admin/config', data),
    toggleMaintenance: (enabled) => axiosInstance.post('/admin/config/maintenance', { enabled }),
    clearCache: () => axiosInstance.post('/admin/config/cache/clear'),
    restartSystem: () => axiosInstance.post('/admin/config/system/restart'),
  },

  // Features
  features: {
    getAll: () => axiosInstance.get('/admin/features'),
    enable: (featureKey) => axiosInstance.post('/admin/features/enable', { feature_key: featureKey }),
    disable: (featureKey) => axiosInstance.post('/admin/features/disable', { feature_key: featureKey }),
  },

  // Subscriptions
  subscriptions: {
    getPlans: () => axiosInstance.get('/admin/subscription-plans'),
    createPlan: (data) => axiosInstance.post('/admin/subscription-plans', data),
    updatePlan: (id, data) => axiosInstance.put(`/admin/subscription-plans/${id}`, data),
    deletePlan: (id) => axiosInstance.delete(`/admin/subscription-plans/${id}`),
  },
};

export default adminAPI;
