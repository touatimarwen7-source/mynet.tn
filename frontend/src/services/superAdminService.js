import axiosConfig from './axiosConfig';

/**
 * 🎯 SUPER ADMIN SERVICE
 * Frontend service layer for all 10 super admin functions
 * Handles communication with /api/super-admin endpoints
 */

const API_BASE = '/api/super-admin';

// ===== 1. STATIC PAGES =====

export const pagesAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/pages`, { params }),
  
  get: (id) => 
    axiosConfig.get(`${API_BASE}/pages/${id}`),
  
  create: (data) => 
    axiosConfig.post(`${API_BASE}/pages`, data),
  
  update: (id, data) => 
    axiosConfig.put(`${API_BASE}/pages/${id}`, data),
  
  delete: (id) => 
    axiosConfig.delete(`${API_BASE}/pages/${id}`)
};

// ===== 2. FILE MANAGEMENT =====

export const filesAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/files`, { params }),
  
  upload: (data) => 
    axiosConfig.post(`${API_BASE}/files`, data),
  
  delete: (id) => 
    axiosConfig.delete(`${API_BASE}/files/${id}`)
};

// ===== 3. DOCUMENT MANAGEMENT =====

export const documentsAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/documents`, { params }),
  
  create: (data) => 
    axiosConfig.post(`${API_BASE}/documents`, data),
  
  delete: (id) => 
    axiosConfig.delete(`${API_BASE}/documents/${id}`)
};

// ===== 4. EMAIL NOTIFICATIONS =====

export const emailsAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/emails`, { params }),
  
  send: (data) => 
    axiosConfig.post(`${API_BASE}/emails/send`, data)
};

// ===== 5. USER MANAGEMENT =====

export const usersAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/users`, { params }),
  
  updateRole: (id, data) => 
    axiosConfig.put(`${API_BASE}/users/${id}/role`, data),
  
  block: (id) => 
    axiosConfig.post(`${API_BASE}/users/${id}/block`),
  
  unblock: (id) => 
    axiosConfig.post(`${API_BASE}/users/${id}/unblock`)
};

// ===== 6. AUDIT LOGS =====

export const auditLogsAPI = {
  list: (params = {}) => 
    axiosConfig.get(`${API_BASE}/audit-logs`, { params })
};

// ===== 7. HEALTH MONITORING =====

export const healthAPI = {
  getStatus: () => 
    axiosConfig.get(`${API_BASE}/health`)
};

// ===== 8. BACKUP & RESTORE =====

export const backupAPI = {
  list: () => 
    axiosConfig.get(`${API_BASE}/backups`),
  
  create: () => 
    axiosConfig.post(`${API_BASE}/backups/create`),
  
  restore: (id) => 
    axiosConfig.post(`${API_BASE}/backups/${id}/restore`)
};

// ===== 9. SUBSCRIPTION PLANS =====

export const subscriptionPlansAPI = {
  list: () => 
    axiosConfig.get(`${API_BASE}/subscription-plans`),
  
  create: (data) => 
    axiosConfig.post(`${API_BASE}/subscription-plans`, data),
  
  update: (id, data) => 
    axiosConfig.put(`${API_BASE}/subscription-plans/${id}`, data),
  
  delete: (id) => 
    axiosConfig.delete(`${API_BASE}/subscription-plans/${id}`)
};

// ===== 10. FEATURE CONTROL =====

export const featuresAPI = {
  list: () => 
    axiosConfig.get(`${API_BASE}/features`),
  
  toggle: (id, data) => 
    axiosConfig.put(`${API_BASE}/features/${id}/toggle`, data)
};

// ===== COMPOSITE EXPORTS =====

export default {
  pages: pagesAPI,
  files: filesAPI,
  documents: documentsAPI,
  emails: emailsAPI,
  users: usersAPI,
  auditLogs: auditLogsAPI,
  health: healthAPI,
  backup: backupAPI,
  subscriptionPlans: subscriptionPlansAPI,
  features: featuresAPI
};
