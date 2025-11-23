

/**
 * 💾 RESPONSE CACHING INTERCEPTOR
 * Automatically caches GET requests for performance
 * Add this to your axios setup
 */
import { getCachedResponse, cacheResponse } from './cacheManager';

export const setupCachingInterceptor = (axiosInstance) => {
  // Response interceptor for caching
  axiosInstance.interceptors.response.use(
    (response) => {
      // Cache successful GET responses for 5 minutes
      if (response.config.method === 'get') {
        const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params)}`;
        cacheResponse(cacheKey, response, 300);
      }
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Request interceptor for checking cache
  axiosInstance.interceptors.request.use(
    (config) => {
      // Check cache for GET requests
      if (config.method === 'get' && config.useCache !== false) {
        const cacheKey = `${config.url}_${JSON.stringify(config.params)}`;
        const cached = getCachedResponse(cacheKey);
        
        if (cached) {
          return Promise.resolve(cached);
        }
      }
      return config;
    }
  );
};

export default setupCachingInterceptor;
