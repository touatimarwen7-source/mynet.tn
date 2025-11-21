// Error Handling Utilities

export const errorHandler = {
  // Get user-friendly error message
  getUserMessage: (error, defaultMessage = 'Une erreur est survenue') => {
    if (!error) return defaultMessage;

    // API error response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Network error
    if (error.code === 'ECONNABORTED') {
      return 'La requête a expiré. Veuillez réessayer.';
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
    }

    // HTTP status errors
    switch (error.response?.status) {
      case 400:
        return 'Requête invalide. Veuillez vérifier vos données.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les permissions pour cette action.';
      case 404:
        return 'La ressource demandée n\'existe pas.';
      case 409:
        return 'Cette action crée un conflit. Veuillez réessayer.';
      case 422:
        return 'Les données envoyées sont invalides.';
      case 429:
        return 'Trop de requêtes. Veuillez attendre avant de réessayer.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Le serveur est temporairement indisponible.';
      default:
        return error.message || defaultMessage;
    }
  },

  // Check if error is auth-related
  isAuthError: (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
  },

  // Handle auth error (logout user)
  handleAuthError: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/login';
  },

  // Log error with context
  logError: (error, context = '') => {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      url: error?.response?.config?.url
    };

    console.error('Error:', errorInfo);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  },

  // Format validation errors
  formatValidationErrors: (errors) => {
    if (!errors) return [];
    if (Array.isArray(errors)) return errors;
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message: Array.isArray(message) ? message[0] : message
    }));
  }
};

export default errorHandler;
