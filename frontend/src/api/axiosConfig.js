
// Axios configuration
import axios from 'axios';
import { API_BASE_URL } from './constants';
import { logger } from '../utils/logger';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // '/api' - سيتم توجيهه عبر Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // مهم للـ cookies والـ CORS
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log configuration in development
    if (import.meta.env.DEV && !window.__AXIOS_CONFIG_LOGGED__) {
      console.log('🔧 Axios Config - Using Vite Proxy with baseURL:', API_BASE_URL);
      window.__AXIOS_CONFIG_LOGGED__ = true;
    }

    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error('Axios Request Error:', error.toJSON());
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error('Axios Response Error - Status:', error.response.status);
      logger.error('Axios Response Error - Data:', error.response.data);

      if (error.response.status === 401) {
        logger.warn('Unauthorized access. Redirecting to login.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 404) {
        logger.warn('Resource not found.');
      }
    } else if (error.request) {
      logger.error('Axios Error - No response received:', error.message);
    } else {
      logger.error('Axios Error - Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
