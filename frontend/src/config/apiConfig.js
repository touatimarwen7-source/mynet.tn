// Centralized API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    
    // Procurement
    TENDERS: '/api/procurement/tenders',
    OFFERS: '/api/procurement/offers',
    INVOICES: '/api/procurement/invoices',
    PURCHASE_ORDERS: '/api/procurement/purchase-orders',
    
    // Supplier
    CATALOG: '/api/supplier/catalog',
    PRODUCTS: '/api/supplier/products',
    DOCUMENTS: '/api/supplier/documents',
    PROFILE: '/api/supplier/profile',
    
    // Admin
    USERS: '/api/admin/users',
    STATISTICS: '/api/admin/statistics',
    AUDIT_LOGS: '/api/admin/audit-logs',
    FEATURES: '/api/admin/features',
    
    // MFA
    MFA_SETUP: '/api/auth/mfa/setup',
    MFA_VERIFY: '/api/auth/mfa/verify-setup'
  }
};

export const getAuthHeader = () => {
  const token = TokenManager.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
