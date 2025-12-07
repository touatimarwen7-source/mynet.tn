/**
 * Token Manager Service
 * Handles JWT token storage and retrieval
 */

class TokenManager {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'access_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_KEY = 'user';
  }

  // Access Token
  setAccessToken(token) {
    if (token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Refresh Token
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // User Data
  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Clear All
  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

// Create and export singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
export { TokenManager };