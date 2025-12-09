/**
 * TokenManager - Manages authentication tokens and user data
 * Provides a centralized singleton for token storage and retrieval
 *
 * @class TokenManager
 * @description Centralized service for managing JWT tokens and user authentication state
 * across localStorage with automatic cleanup and validation.
 *
 * @example
 * // Save user data after login
 * TokenManager.setUser({ id: 1, email: 'user@example.com', role: 'buyer' });
 *
 * // Retrieve user data
 * const user = TokenManager.getUser();
 *
 * // Clear on logout
 * TokenManager.clearTokens();
 */
class TokenManager {
  /**
   * Initialize TokenManager instance
   * Sets up storage keys and initializes user data from localStorage
   * @constructor
   */
  constructor() {
    this.ACCESS_TOKEN_KEY = 'auth_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_KEY = 'user_data';
  }

  // Gestion du token d'accès
  /**
   * Set the access token in localStorage
   * @param {string} token - The access token to set
   * @returns {void}
   */
  setAccessToken(token) {
    if (token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  /**
   * Get the access token from localStorage
   * @returns {string|null} The access token or null if not found
   */
  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Gestion du token de rafraîchissement
  /**
   * Set the refresh token in localStorage
   * @param {string} token - The refresh token to set
   * @returns {void}
   */
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * Get the refresh token from localStorage
   * @returns {string|null} The refresh token or null if not found
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Gestion des données utilisateur
  /**
   * Store user data in localStorage
   * @param {Object} userData - User object from authentication response
   * @param {number|string} userData.id - User ID
   * @param {string} userData.email - User email
   * @param {string} userData.role - User role (buyer, supplier, admin, etc.)
   * @param {string} [userData.username] - Optional username
   * @param {string} [userData.company_name] - Optional company name
   * @returns {void}
   * @throws {Error} If userData is invalid or missing required fields
   */
  setUser(userData) {
    if (!userData || typeof userData !== 'object') {
      console.warn('TokenManager: Attempted to set null/undefined user');
      return;
    }

    // Normalize userId and id
    const normalizedUser = {
      ...userData,
      userId: userData.userId || userData.id,
      id: userData.id || userData.userId
    };

    if (!normalizedUser.userId && !normalizedUser.id) {
      console.error('TokenManager: User data missing both userId and id:', userData);
      return;
    }

    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
      } catch (e) {
        console.warn('SessionStorage unavailable:', e);
      }
      // Reduce console spam - only log in development
      if (import.meta.env.DEV) {
        console.log('TokenManager: User data stored successfully');
      }
    } catch (error) {
      console.error('TokenManager: Error storing user data:', error);
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
        console.log('TokenManager: Fallback to sessionStorage');
      } catch (fallbackError) {
        console.error('TokenManager: All storage methods failed:', fallbackError);
      }
    }
  }

  /**
   * Get user data from localStorage
   * @returns {Object|null} The user object or null if not found or an error occurs
   */
  getUser() {
    try {
      // Try localStorage first
      let userJson = localStorage.getItem(this.USER_KEY);
      
      // Fallback to sessionStorage
      if (!userJson) {
        try {
          userJson = sessionStorage.getItem(this.USER_KEY);
        } catch (e) {
          console.warn('SessionStorage read failed:', e);
        }
      }
      
      if (!userJson) {
        if (import.meta.env.DEV) {
          console.log('TokenManager: No user data in storage');
        }
        return null;
      }

      const user = JSON.parse(userJson);
      // Only log in development and not repeatedly
      if (import.meta.env.DEV && !userJson.includes('"userId"')) {
        console.log('TokenManager: User data retrieved');
      }
      return user;
    } catch (error) {
      console.error('TokenManager: Error retrieving user data:', error);
      return null;
    }
  }

  // Gestion complète des tokens
  /**
   * Manage authentication tokens and user data
   * Sets access token, refresh token, and user data simultaneously
   * @param {string} accessToken - The access token
   * @param {string} refreshToken - The refresh token
   * @param {Object} userData - The user data object
   * @returns {void}
   */
  manageTokens(accessToken, refreshToken, userData) {
    if (accessToken) this.setAccessToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
    if (userData) this.setUser(userData);
  }

  /**
   * Alias for setUser method for backward compatibility
   * @param {Object} userData - User data object
   * @returns {void}
   */
  setUserData(userData) {
    this.setUser(userData);
  }

  /**
   * Clear all authentication data from localStorage
   * Called during logout to ensure clean state
   * @returns {void}
   */
  clearTokens() {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('TokenManager: Error clearing tokens:', error);
    }
  }

  /**
   * Check if the user is authenticated
   * Authenticated if an access token exists
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * Extract user data from a JWT token
   * @param {string} token - The JWT token
   * @returns {Object|null} Decoded token payload or null if decoding fails
   */
  getUserFromToken(token) {
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Check if the current access token is valid (not expired)
   * @returns {boolean} True if the token is valid, false otherwise
   */
  isTokenValid() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.getUserFromToken(token);
      if (!decoded || !decoded.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch (error) {
      // Handle potential errors during token decoding or validation
      console.error('TokenManager: Error during token validation:', error);
      return false;
    }
  }

  /**
   * Check if the access token needs to be refreshed
   * Refreshes if the token expires in less than 2 minutes
   * @returns {boolean} True if the token should be refreshed, false otherwise
   */
  shouldRefreshToken() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.getUserFromToken(token);
      if (!decoded || !decoded.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;

      // Refresh if less than 2 minutes until expiry
      return timeUntilExpiry > 0 && timeUntilExpiry < 120;
    } catch (error) {
      // Handle potential errors during token decoding or validation
      console.error('TokenManager: Error checking if token should be refreshed:', error);
      return false;
    }
  }

  /**
   * Get the remaining time until the access token expires, in seconds
   * @returns {number} The time in seconds until expiration, or 0 if token is invalid or not found
   */
  getTimeUntilExpiry() {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = this.getUserFromToken(token);
      if (!decoded || !decoded.exp) return 0;

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - now);
    } catch (error) {
      // Handle potential errors during token decoding or validation
      console.error('TokenManager: Error getting time until expiry:', error);
      return 0;
    }
  }

  /**
   * Authenticate using a provided login function with retry mechanism
   * @param {Function} loginFunction - The function to call for authentication (e.g., api.login)
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   * @param {number} [retries=3] - The number of retry attempts
   * @param {number} [delay=1000] - The delay between retries in milliseconds
   * @returns {Promise<Object>} A promise that resolves with the authentication response
   * @throws {Error} If authentication fails after all retries
   */
  static async authenticateWithRetry(loginFunction, username, password, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await loginFunction(username, password);
        if (response && response.accessToken) {
          tokenManager.manageTokens(response.accessToken, response.refreshToken, response.userData);
          return response;
        } else {
          throw new Error('Login failed: Missing tokens in response.');
        }
      } catch (error) {
        console.error(`Attempt ${i + 1}/${retries} failed:`, error.message);
        if (i === retries - 1) {
          console.error('Authentication failed after multiple retries.');
          throw error; // Re-throw the last error
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Restore user data from localStorage if available and valid
   * @returns {Object|null} The restored user object or null if not found or invalid
   */
  restoreFromStorage() {
    try {
      // Check localStorage for user data (primary storage)
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && (user.userId || user.id)) {
          if (import.meta.env.DEV) {
            console.log('TokenManager: User restored from storage');
          }
          return user;
        }
      }
    } catch (e) {
      console.error('TokenManager: Failed to restore from storage:', e);
      // Clear corrupted data
      this.clearTokens();
    }
    return null;
  }
}

// Create singleton instance
const tokenManagerInstance = new TokenManager();

// Default export (primary)
export default tokenManagerInstance;

// Named exports for different use cases
export const tokenManager = tokenManagerInstance;
export { TokenManager };