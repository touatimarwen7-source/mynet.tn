// Axios configuration
import axios from 'axios';
import { API_BASE_URL } from './constants';
import { logger } from './logger'; // Assuming logger utility exists

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log configuration in development (only once)
    if (import.meta.env.DEV && !window.__AXIOS_CONFIG_LOGGED__) {
      console.log('🔧 Axios Config - API Base URL:', API_BASE_URL);
      window.__AXIOS_CONFIG_LOGGED__ = true;
    }

    // You can add auth tokens or other headers here
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    // Log request errors
    logger.error('Axios Request Error:', error.toJSON());
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error('Axios Response Error - Data:', error.response.data);
      logger.error('Axios Response Error - Status:', error.response.status);
      logger.error('Axios Response Error - Headers:', error.response.headers);

      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - e.g., redirect to login
        logger.warn('Unauthorized access. Redirecting to login.');
        // window.location.href = '/login';
      } else if (error.response.status === 404) {
        // Not Found
        logger.warn('Resource not found.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      logger.error('Axios Error - No response received:', error.request.toJSON());
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('Axios Error - Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;