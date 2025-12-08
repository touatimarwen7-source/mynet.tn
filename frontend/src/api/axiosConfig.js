
import axios from 'axios';

// Base URL configuration for Replit
const getBaseURL = () => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In browser, use Vite proxy by using relative paths
  if (typeof window !== 'undefined') {
    // Simply use relative path - Vite proxy will handle it
    console.log('🔧 Using Vite proxy - relative URLs');
    return '';
  }

  // Fallback (shouldn't happen in browser)
  console.warn('⚠️ Running outside browser - using fallback');
  return '';
};

const BASE_URL = getBaseURL();
console.log('✅ Final API Base URL:', BASE_URL || 'Using Vite Proxy (relative paths)');

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📤 Full URL:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message, error.config?.url);
    console.error('❌ Full URL tried:', `${error.config?.baseURL}${error.config?.url}`);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
