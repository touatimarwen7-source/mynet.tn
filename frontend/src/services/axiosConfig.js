/**
 * Axios Configuration with Security & Caching Features
 *
 * Handles:
 * - Automatic Bearer token injection
 * - Automatic CSRF token headers
 * - Token expiration verification
 * - Automatic token refresh (2 min before expiry)
 * - Response caching (5-minute stale-while-revalidate)
 * - 401/403 handling with redirect
 * - Request timeout (30s)
 * - httpOnly cookie support
 *
 * @module axiosConfig
 * @requires axios - HTTP client
 * @requires TokenManager - Token storage/retrieval
 * @requires CSRFProtection - CSRF token management
 */

import axios from 'axios';
import TokenManager from './tokenManager';
import CSRFProtection from '../utils/csrfProtection';
import { API_CONFIG, shouldCache, getCacheDuration, isPublicEndpoint } from '../config/apiConfig';
import logger from '../utils/logger'; // Assuming logger utility is available

// Get current host from window location
const getCurrentHost = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  const { protocol, hostname } = window.location;
  const isReplit = hostname.includes('replit.dev');

  if (isReplit) {
    // Use HTTP with port 3000 for Replit backend
    return `http://${hostname.replace(':5000', '')}:3000`;
  }

  return import.meta.env.DEV
    ? 'http://localhost:3000'
    : `${protocol}//${hostname}:3000`;
};

// ✅ استخدام window.location.hostname للحصول على الـ host الصحيح
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // في بيئة Replit، استخدم نفس الـ hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `${window.location.protocol}//${hostname}:3000/api`;
  }
  
  return 'http://0.0.0.0:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL.replace(/\/api\/api/, '/api'), // Éviter double /api/
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  logger.debug('Axios Instance Created', {
    baseURL: axiosInstance.defaults.baseURL,
    timeout: axiosInstance.defaults.timeout
  });
}

// ============================================
// Response Cache
// ============================================
const responseCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes default (reduced from 5)

const getCacheKey = (config) => {
  return `${config.method}:${config.url}`;
};

const isCacheValid = (cacheEntry, duration = CACHE_DURATION) => {
  return Date.now() - cacheEntry.timestamp < duration;
};

const getCachedResponse = (config) => {
  // Check if endpoint should be cached
  if (!shouldCache(config.url)) {
    return null;
  }
  const key = getCacheKey(config);
  const cached = responseCache.get(key);
  const duration = getCacheDuration(config.url) || CACHE_DURATION;
  if (cached && isCacheValid(cached, duration)) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (config, response) => {
  const key = getCacheKey(config);
  responseCache.set(key, {
    data: response,
    timestamp: Date.now(),
  });
};

// Create axios instance
// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Enable cookies
//   timeout: 30000, // 30 second timeout
// });

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

/**
 * Request Interceptor
 * - Verify token is not expired
 * - Add authorization header
 * - Add CSRF token from meta tag
 * - Check if token needs refresh
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    // ✅ فحص صحة الخادم الخلفي قبل كل طلب
    if (!await checkBackendHealth()) {
      return Promise.reject(new Error('Backend is not healthy'));
    }

    // Check if endpoint is public (uses centralized config)
    const isPublic = isPublicEndpoint(config.url);

    // Check if access token is expired (but not for public endpoints)
    if (!isPublic && !TokenManager.isTokenValid()) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      return Promise.reject(new Error('Token expired'));
    }

    // Add access token only if available and not for public endpoints
    const token = TokenManager.getAccessToken();
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token from meta tag (generated in main.jsx)
    const csrfToken = CSRFProtection.getToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Add additional security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-Content-Type-Options'] = 'nosniff';

    // DEBUG: Log login requests
    if (config.url?.includes('auth/login')) {
      if (import.meta.env.DEV) {
        logger.debug('Request Interceptor', {
          url: config.url,
          method: config.method,
          hasData: !!config.data,
        });
      }
    }

    // Check if token should be refreshed proactively (only if we have a token)
    if (token && TokenManager.shouldRefreshToken() && !isRefreshing) {
      // Silently refresh in background
      refreshAccessToken().catch((err) => {});
    }

    return config;
  },
  (error) => {
    logger.error('Request Error', { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Cache successful GET requests
 * - Handle 401 errors
 * - Automatically refresh token
 * - Retry failed requests
 * - Normalize error responses to always include string error message
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // تخزين مؤقت للطلبات الناجحة GET فقط
    if (response.config.method === 'get' && response.status === 200) {
      try {
        const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
        responseCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      } catch (cacheError) {
        // تجاهل أخطاء التخزين المؤقت
        logger.warn('Cache error:', cacheError.message);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Normalize error response to always have a string error message
    if (error.response?.data) {
      if (typeof error.response.data !== 'object' || error.response.data === null) {
        error.response.data = { error: String(error.response.data) };
      } else if (!error.response.data.error || typeof error.response.data.error !== 'string') {
        error.response.data.error =
          error.response.data.message ||
          error.response.data.msg ||
          "Une erreur serveur s'est produite";
      }
    }

    // Try to use cache on network error for GET requests
    if (!error.response && originalRequest?.method === 'get') {
      const cached = getCachedResponse(originalRequest);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Logout user
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Only log 403, don't immediately logout
      // Let components handle the 403 appropriately without clearing auth
      logger.error('Response Error', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
      });
    } else if (error.response) {
      // Log other response errors
      logger.error('Response Error', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
      });
    } else {
      // Log network errors
      logger.error('Request Error', { error: error.message });
    }

    return Promise.reject(error);
  }
);

/**
 * Refresh access token
 * Uses httpOnly cookie (sent automatically by browser)
 * Backend sends new access token in response
 *
 * @returns {Promise<string>} New access token
 */
async function refreshAccessToken() {
  try {
    // Backend will send refresh token via httpOnly cookie automatically
    const response = await axios.post(
      '/auth/refresh-token',
      {}, // Empty body - refresh token is in cookie
      {
        withCredentials: true,
        timeout: 10000,
      }
    );

    if (!response.data.accessToken) {
      throw new Error('No access token in refresh response');
    }

    const { accessToken, expiresIn } = response.data;
    TokenManager.setAccessToken(accessToken, expiresIn || 900);

    return accessToken;
  } catch (err) {
    throw err;
  }
}

/**
 * Enhanced logout
 * Clears tokens and notifies backend
 */
async function logout() {
  try {
    // Notify backend (backend will clear httpOnly cookie)
    await axiosInstance.post('/auth/logout');
  } catch (err) {
  } finally {
    // Always clear frontend tokens
    TokenManager.clearTokens();
    window.location.href = '/login';
  }
}

// ✅ فحص صحة الخادم الخلفي
let backendHealthy = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

async function checkBackendHealth() {
  const now = Date.now();
  if (backendHealthy && (now - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return true;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    backendHealthy = response.status === 200;
    lastHealthCheck = now;
    console.log('✅ Backend health check: OK');
    return true;
  } catch (error) {
    backendHealthy = false;
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

// Export health check function
export { axiosInstance, refreshAccessToken, logout, TokenManager, checkBackendHealth };
export default axiosInstance;