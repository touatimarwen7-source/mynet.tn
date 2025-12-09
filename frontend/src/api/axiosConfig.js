import axios from 'axios';
import tokenManager from '../services/tokenManager';

// Determine API base URL
const getApiBaseUrl = () => {
  // Check for explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production/Replit environment
  if (import.meta.env.PROD || window.location.hostname.includes('replit')) {
    const currentOrigin = window.location.origin;
    // If frontend is on port 5000, backend is on port 3000
    if (currentOrigin.includes(':5000')) {
      return currentOrigin.replace(':5000', ':3000');
    }
    return currentOrigin;
  }

  // Local development - use 0.0.0.0 instead of localhost to avoid CSP issues
  const protocol = window.location.protocol;
  return `${protocol}//0.0.0.0:3000`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Axios Config - API Base URL:', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  validateStatus: (status) => status < 500, // Accept all non-5xx as valid
});

// Retry configuration for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const shouldRetry = (error) => {
  if (!error.config || error.config.__retryCount >= MAX_RETRIES) {
    return false;
  }

  // Retry on network errors and 5xx server errors
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    (error.response && error.response.status >= 500)
  );
};

// Request Interceptor - Ajouter le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging pour debug (only in development)
    if (import.meta.env.DEV && !config.url.includes('/health')) {
      console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        hasAuth: !!token
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Gestion des erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    // Only log non-health check responses in development
    if (import.meta.env.DEV && !response.config.url.includes('/health')) {
      console.log(`✅ Response: ${response.config.url}`, {
        status: response.status
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logging détaillé des erreurs (only non-health-check endpoints)
    if (!error.config?.url?.includes('/health')) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Retry logic for transient failures
    if (shouldRetry(error)) {
      originalRequest.__retryCount = (originalRequest.__retryCount || 0) + 1;

      const delay = RETRY_DELAY * originalRequest.__retryCount;
      console.log(`⚠️ Retrying request (${originalRequest.__retryCount}/${MAX_RETRIES}) after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    // Gestion des erreurs réseau
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'La requête a expiré. Vérifiez votre connexion.';
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        error.userMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        error.userMessage = 'Erreur de communication avec le serveur.';
      }
      return Promise.reject(error);
    }

    // Gestion 401 - Token expiré
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        tokenManager.setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Gestion 400 - Erreurs de validation
    if (error.response.status === 400) {
      error.userMessage = error.response.data?.error || 'Requête invalide.';
    }

    // Gestion 403 - Accès refusé
    if (error.response.status === 403) {
      error.userMessage = "Vous n'avez pas les permissions nécessaires.";
    }

    // Gestion 404 - Ressource non trouvée
    if (error.response.status === 404) {
      error.userMessage = 'Ressource non trouvée.';
    }

    // Gestion 500 - Erreur serveur
    if (error.response.status >= 500) {
      error.userMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;