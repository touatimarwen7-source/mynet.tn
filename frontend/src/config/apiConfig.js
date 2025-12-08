// ✅ Centralized API Configuration - Dynamic Base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const isReplit = window.location.hostname.includes('replit.dev');
    
    if (isReplit) {
      const hostname = window.location.hostname.split(':')[0];
      return `http://${hostname}:3000`;
    }
    
    return 'http://localhost:3000';
  }
  
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = 30000;

// Public endpoints that require no authentication
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/password-reset',
];

// Cache configuration with 2-minute default duration (reduced from 5)
const CACHE_CONFIG = {
  ENABLED: true,
  DEFAULT_DURATION_MS: 2 * 60 * 1000, // 2 minutes (reduced for better freshness)
  // Endpoints that should never be cached (always fresh data)
  NEVER_CACHE: [
    '/auth/profile',
    '/procurement/my-tenders',
    '/procurement/my-offers',
    '/notifications',
  ],
  // Custom cache duration per endpoint (in milliseconds)
  CUSTOM_DURATION: {
    '/procurement/tenders': 5 * 60 * 1000,
    '/procurement/offers': 5 * 60 * 1000,
    '/search/tenders': 3 * 60 * 1000,
    '/admin/statistics': 10 * 60 * 1000,
  },
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  PUBLIC_ENDPOINTS,
  CACHE: CACHE_CONFIG,
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
    MFA_VERIFY: '/api/auth/mfa/verify-setup',
  },
};

export const getAuthHeader = () => {
  const token = TokenManager.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const isPublicEndpoint = (endpoint) => {
  return PUBLIC_ENDPOINTS.some((ep) => endpoint === ep || endpoint?.includes(ep));
};

export const shouldCache = (endpoint) => {
  if (!CACHE_CONFIG.ENABLED) return false;
  return !CACHE_CONFIG.NEVER_CACHE.some((ep) => endpoint.includes(ep));
};

export const getCacheDuration = (endpoint) => {
  return CACHE_CONFIG.CUSTOM_DURATION[endpoint] || CACHE_CONFIG.DEFAULT_DURATION_MS;
};