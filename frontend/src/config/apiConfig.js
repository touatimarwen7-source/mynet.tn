// ✅ No base URL - use Vite proxy
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

// Cache configuration
const CACHE_CONFIG = {
  '/api/procurement/tenders': 120000, // 2 minutes
  '/api/admin/users': 120000,
  '/api/analytics': 120000,
  default: 120000,
};

export const API_CONFIG = {
  TIMEOUT: API_TIMEOUT,
};

export const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
};

export const shouldCache = (url) => {
  return url?.includes('/api/') && !url?.includes('auth');
};

export const getCacheDuration = (url) => {
  const match = Object.keys(CACHE_CONFIG).find((key) => url?.includes(key));
  return match ? CACHE_CONFIG[match] : CACHE_CONFIG.default;
};