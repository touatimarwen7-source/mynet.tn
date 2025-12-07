
/**
 * Token Manager Service
 * Handles JWT token storage and retrieval
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class TokenManager {
  /**
   * Store access token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Get access token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Alias for getToken (for backward compatibility)
   */
  getAccessToken() {
    return this.getToken();
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store user data
   */
  setUser(userData) {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }

  /**
   * Get user data
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Clear all tokens and user data
   */
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Manage tokens (set or clear)
   */
  manageTokens(token = null, refreshToken = null, userData = null) {
    if (token) {
      this.setToken(token);
      if (refreshToken) {
        this.setRefreshToken(refreshToken);
      }
      if (userData) {
        this.setUser(userData);
      }
    } else {
      this.clearToken();
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

// Export both the instance and the class
export { tokenManager, TokenManager };
export default tokenManager;
