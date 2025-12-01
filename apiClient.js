import axios from 'axios';
import { camelCase, snakeCase } from 'lodash';

// Recursively converts object keys using the provided converter function.
const convertKeys = (data, converter) => {
  if (Array.isArray(data)) {
    return data.map(v => convertKeys(v, converter));
  }
  if (data !== null && data.constructor === Object) {
    return Object.keys(data).reduce((result, key) => ({
      ...result,
      [converter(key)]: convertKeys(data[key], converter),
    }), {});
  }
  return data;
};

/**
 * Create a centralized axios client for API requests.
 * It includes interceptors to automatically add the auth token and handle session timeouts.
 */
const apiClient = axios.create({
  /**
   * The base URL for all API requests.
   * It's recommended to use environment variables for this.
   * Example: process.env.REACT_APP_API_URL
   */
  baseURL: 'http://localhost:5000/api/v1', // Replace with your actual API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor 1: Convert request data keys from camelCase to snake_case.
 * This runs before the token is added.
 */
apiClient.interceptors.request.use(config => {
  if (config.data) {
    config.data = convertKeys(config.data, snakeCase);
  }
  return config;
});

/**
 * Request Interceptor 2:
 * Automatically adds the JWT token to the Authorization header for every outgoing request.
 */
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor 1: Convert response data keys from snake_case to camelCase.
 * This runs first on the response data.
 */
apiClient.interceptors.response.use(response => {
  if (response.data) {
    response.data = convertKeys(response.data, camelCase);
  }
  return response;
});

/**
 * Response Interceptor 2:
 * Handles common API errors, such as 401 Unauthorized for expired sessions.
 */
apiClient.interceptors.response.use(
  response => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is expired or invalid, log the user out.
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login page with a message indicating session expiration.
      window.location.href = '/login?sessionExpired=true';
    }
    return Promise.reject(error);
  }
);

export default apiClient;