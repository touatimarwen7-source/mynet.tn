/**
 * Axios Configuration with Security & Caching Features
 * 
 * - Automatic token injection
 * - Automatic token refresh
 * - CSRF protection headers
 * - Request caching (stale-while-revalidate)
 * - Error handling
 */

import axios from 'axios';
import TokenManager from './tokenManager';

const API_BASE_URL = '/api';

// ============================================
// Response Cache
// ============================================
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

const getCacheKey = (config) => {
  return `${config.method}:${config.url}`;
};

const isCacheValid = (cacheEntry) => {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

const getCachedResponse = (config) => {
  const key = getCacheKey(config);
  const cached = responseCache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (config, response) => {
  const key = getCacheKey(config);
  responseCache.set(key, {
    data: response,
    timestamp: Date.now()
  });
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable cookies
  timeout: 30000 // 30 second timeout
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

/**
 * Request Interceptor
 * - Add authorization header
 * - Add CSRF token from meta tag
 * - Check if token needs refresh
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add access token
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Check if token should be refreshed proactively
    if (TokenManager.shouldRefreshToken() && !isRefreshing) {
      // Silently refresh in background
      refreshAccessToken().catch((err) => {
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - Cache successful GET requests
 * - Handle 401 errors
 * - Automatically refresh token
 * - Retry failed requests
 * - Clear tokens on 403 (forbidden)
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === 'get') {
      setCachedResponse(response.config, response);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Try to use cache on network error for GET requests
    if (!error.response && originalRequest.method === 'get') {
      const cached = getCachedResponse(originalRequest);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => {
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

    // Handle 403 Forbidden (invalid/expired session)
    if (error.response?.status === 403) {
      TokenManager.clearTokens();
      window.location.href = '/login';
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
      `${API_BASE_URL}/auth/refresh-token`,
      {}, // Empty body - refresh token is in cookie
      {
        baseURL: API_BASE_URL,
        withCredentials: true,
        timeout: 10000
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

export { axiosInstance, refreshAccessToken, logout, TokenManager };
export default axiosInstance;
