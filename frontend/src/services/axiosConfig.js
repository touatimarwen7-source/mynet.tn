import axios from 'axios';
import TokenManager from './tokenManager';
import CSRFProtection from '../utils/csrfProtection';
import { shouldCache, getCacheDuration, isPublicEndpoint } from '../config/apiConfig';
import logger from '../utils/logger';

// ✅ Direct backend connection (bypassing Vite proxy to fix 502)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('✅ Axios configured with direct backend URL:', API_BASE_URL);

// Response Cache
const responseCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000;

const getCacheKey = (config) => {
  return `${config.method}:${config.url}`;
};

const isCacheValid = (cacheEntry, duration = CACHE_DURATION) => {
  return Date.now() - cacheEntry.timestamp < duration;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const isPublic = isPublicEndpoint(config.url);

    if (!isPublic && !TokenManager.isTokenValid()) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      return Promise.reject(new Error('Token expired'));
    }

    const token = TokenManager.getAccessToken();
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = CSRFProtection.getToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Check cache
    if (config.method === 'get' && shouldCache(config.url)) {
      const cacheKey = getCacheKey(config);
      const cached = responseCache.get(cacheKey);
      if (cached && isCacheValid(cached, getCacheDuration(config.url))) {
        return Promise.reject({
          __fromCache: true,
          data: cached.data,
          config,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
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

axiosInstance.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && shouldCache(response.config.url)) {
      const cacheKey = getCacheKey(response.config);
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  async (error) => {
    // Handle cached responses
    if (error.__fromCache) {
      return Promise.resolve({ data: error.data, __fromCache: true });
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        });

        const { accessToken } = response.data;
        TokenManager.setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;