/**
 * Error Codes System
 * Centralized error definitions for application-wide error handling
 *
 * Format: { code: 'ERROR_TYPE', message: 'User-friendly message', severity: 'error|warning|info' }
 * Severity: error (critical), warning (recoverable), info (informational)
 */

// ============================================
// Authentication Errors (A001 - A099)
// ============================================
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'A001',
    message: 'Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.',
    severity: 'error',
  },
  ACCOUNT_LOCKED: {
    code: 'A002',
    message: 'Votre compte est verrouillé. Veuillez réessayer plus tard.',
    severity: 'error',
  },
  INVALID_TOKEN: {
    code: 'A003',
    message: 'Le jeton est invalide ou expiré.',
    severity: 'error',
  },
  TOKEN_EXPIRED: {
    code: 'A004',
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
    severity: 'warning',
  },
  UNAUTHORIZED: {
    code: 'A005',
    message: "Vous n'êtes pas autorisé à accéder à cette ressource.",
    severity: 'error',
  },
  SESSION_EXPIRED: {
    code: 'A006',
    message: 'Votre session a expiré. Vous serez redirigé vers la page de connexion.',
    severity: 'warning'
  },
  MFA_REQUIRED: {
    code: 'A007',
    message: 'Authentification à deux facteurs requise.',
    severity: 'info'
  },
  INVALID_MFA_CODE: {
    code: 'A008',
    message: 'Code MFA invalide.',
    severity: 'error'
  }
};

// ============================================
// Validation Errors (V001 - V099)
// ============================================
export const VALIDATION_ERRORS = {
  INVALID_EMAIL: {
    code: 'V001',
    message: 'Format d\'email invalide.',
    severity: 'error'
  },
  INVALID_PHONE: {
    code: 'V002',
    message: 'Format de téléphone invalide.',
    severity: 'error'
  },
  PASSWORD_TOO_SHORT: {
    code: 'V003',
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
    severity: 'error'
  },
  REQUIRED_FIELD: {
    code: 'V004',
    message: 'Ce champ est obligatoire.',
    severity: 'error'
  },
  INVALID_FORMAT: {
    code: 'V005',
    message: 'Format de données invalide.',
    severity: 'error'
  },
  VALUE_TOO_LONG: {
    code: 'V006',
    message: 'La valeur est trop longue.',
    severity: 'error'
  },
  VALUE_TOO_SHORT: {
    code: 'V007',
    message: 'La valeur est trop courte.',
    severity: 'error'
  }
};

// ============================================
// Network Errors (N001 - N099)
// ============================================
export const NETWORK_ERRORS = {
  CONNECTION_LOST: {
    code: 'N001',
    message: 'La connexion a été perdue. Veuillez réessayer.',
    severity: 'warning'
  },
  NO_INTERNET: {
    code: 'N002',
    message: 'Vous n\'avez pas de connexion Internet.',
    severity: 'error'
  },
  SERVER_UNAVAILABLE: {
    code: 'N003',
    message: 'Le serveur n\'est pas disponible. Veuillez réessayer plus tard.',
    severity: 'error'
  },
  SERVICE_UNAVAILABLE: {
    code: 'N004',
    message: 'Le service n\'est pas disponible pour le moment.',
    severity: 'warning'
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'N005',
    message: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.',
    severity: 'warning'
  },
  REQUEST_TIMEOUT: {
    code: 'N006',
    message: 'La requête a pris trop de temps.',
    severity: 'warning'
  }
};

// ============================================
// System Errors (S001 - S099)
// ============================================
export const SYSTEM_ERRORS = {
  INTERNAL_ERROR: {
    code: 'S001',
    message: 'Une erreur système s\'est produite. Veuillez réessayer plus tard.',
    severity: 'error'
  },
  DATABASE_ERROR: {
    code: 'S002',
    message: 'Erreur de base de données.',
    severity: 'error'
  },
  UNKNOWN_ERROR: {
    code: 'S999',
    message: 'Une erreur inconnue s\'est produite.',
    severity: 'error'
  }
};

// ============================================
// Combined Error Codes
// ============================================
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...VALIDATION_ERRORS,
  ...NETWORK_ERRORS,
  ...SYSTEM_ERRORS,

  // Quick access
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get error by code
 */
export function getErrorByCode(code) {
  const allErrors = { ...AUTH_ERRORS, ...VALIDATION_ERRORS, ...NETWORK_ERRORS, ...SYSTEM_ERRORS };

  for (const [key, value] of Object.entries(allErrors)) {
    if (value.code === code) {
      return value;
    }
  }

  return SYSTEM_ERRORS.UNKNOWN_ERROR;
}

/**
 * Format error for display
 */
export function formatError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Map HTTP status to error codes
    const statusMap = {
      400: VALIDATION_ERRORS.INVALID_FORMAT,
      401: AUTH_ERRORS.UNAUTHORIZED,
      403: AUTH_ERRORS.UNAUTHORIZED,
      404: { code: 'NOT_FOUND', message: 'Ressource non trouvée', severity: 'error' },
      409: { code: 'CONFLICT', message: 'Conflit de données', severity: 'error' },
      429: NETWORK_ERRORS.RATE_LIMIT_EXCEEDED,
      500: SYSTEM_ERRORS.INTERNAL_ERROR,
      502: NETWORK_ERRORS.SERVER_UNAVAILABLE,
      503: NETWORK_ERRORS.SERVICE_UNAVAILABLE,
      504: NETWORK_ERRORS.REQUEST_TIMEOUT
    };

    const errorInfo = statusMap[status] || SYSTEM_ERRORS.UNKNOWN_ERROR;

    return {
      code: data?.code || errorInfo.code,
      message: data?.message || errorInfo.message,
      severity: errorInfo.severity
    };
  }

  if (!error.response && error.request) {
    return NETWORK_ERRORS.CONNECTION_LOST;
  }

  return SYSTEM_ERRORS.UNKNOWN_ERROR;
}