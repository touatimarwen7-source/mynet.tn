/**
 * Enhanced Token Manager for Replit iframe compatibility
 * Uses in-memory storage as primary to avoid iframe restrictions
 * Falls back to safe sessionStorage for persistence
 */

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_DATA_KEY = 'user_data';

// In-memory storage (primary for Replit iframe)
let memoryAccessToken = null;
let tokenExpiryTime = null;
let memoryUserData = null;

// Store listener callbacks for cross-tab sync
let authChangeListeners = [];

class TokenManager {
  /**
   * Store access token with expiry time
   * Primary: in-memory | Backup: sessionStorage
   */
  static setAccessToken(token, expiresIn = 900) {
    if (!token || typeof token !== 'string') {
      return;
    }

    const tokenExpiryMs = Date.now() + expiresIn * 1000;
    
    // Set in memory FIRST (fastest, no iframe issues)
    memoryAccessToken = token;
    tokenExpiryTime = tokenExpiryMs;
    
    // Try to persist using sessionStorage
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiryMs));
    } catch (e) {
      // sessionStorage might fail in some environments
    }

    // Notify listeners
    this._notifyListeners();
  }

  /**
   * Get access token from memory (fastest) or storage
   * Ensures token is ALWAYS available in memory
   */
  static getAccessToken() {
    // Check memory first (fastest, always works)
    if (memoryAccessToken && this.isTokenValid()) {
      return memoryAccessToken;
    }

    // Try to restore from sessionStorage
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (token && expiryStr) {
        const expiryTime = parseInt(expiryStr, 10);
        if (!isNaN(expiryTime) && Date.now() < expiryTime) {
          // Restore to memory for next call
          memoryAccessToken = token;
          tokenExpiryTime = expiryTime;
          return token;
        }
      }
    } catch (e) {
      // sessionStorage might fail
    }

    // No token found or expired
    memoryAccessToken = null;
    tokenExpiryTime = null;
    return null;
  }

  /**
   * Check if token is valid (not expired)
   * Always checks memory first
   */
  static isTokenValid() {
    if (!memoryAccessToken || !tokenExpiryTime) {
      return false;
    }
    const isValid = Date.now() < tokenExpiryTime;
    if (!isValid) {
      memoryAccessToken = null;
      tokenExpiryTime = null;
    }
    return isValid;
  }

  /**
   * Clear all tokens (logout)
   */
  static clearTokens() {
    memoryAccessToken = null;
    tokenExpiryTime = null;
    memoryUserData = null;

    // Try to clear from storage
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
    } catch (e) {
      // Ignore errors
    }

    this._notifyListeners();
  }

  /**
   * Store user data
   */
  static setUserData(userData) {
    memoryUserData = userData;

    try {
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Get user data
   */
  static getUserData() {
    if (memoryUserData) {
      return memoryUserData;
    }

    try {
      const userData = sessionStorage.getItem(USER_DATA_KEY);
      if (userData) {
        memoryUserData = JSON.parse(userData);
        return memoryUserData;
      }
    } catch (e) {
      // Ignore
    }

    return null;
  }

  /**
   * Get time until token expiry
   */
  static getTimeUntilExpiry() {
    if (!tokenExpiryTime) return 0;
    return Math.max(0, tokenExpiryTime - Date.now());
  }

  /**
   * Check if token needs refresh
   */
  static shouldRefreshToken() {
    return this.getTimeUntilExpiry() < 2 * 60 * 1000;
  }

  /**
   * Decode JWT token (basic decode without verification)
   */
  static decodeToken(token) {
    try {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (err) {
      return null;
    }
  }

  /**
   * Get user info from token
   */
  static getUserFromToken() {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  /**
   * Register listener for auth changes
   */
  static onAuthChange(callback) {
    authChangeListeners.push(callback);
    return () => {
      authChangeListeners = authChangeListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of auth change
   */
  static _notifyListeners() {
    authChangeListeners.forEach(cb => {
      try {
        cb({
          token: memoryAccessToken,
          user: memoryUserData,
          isAuthenticated: !!memoryAccessToken && this.isTokenValid()
        });
      } catch (e) {
      }
    });
  }

  /**
   * Restore tokens from storage (call on app init)
   */
  static restoreFromStorage() {
    let restored = false;

    // Try sessionStorage first
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      const userDataStr = sessionStorage.getItem(USER_DATA_KEY);

      if (token && expiryStr) {
        const expiryTime = parseInt(expiryStr, 10);
        if (!isNaN(expiryTime) && Date.now() < expiryTime) {
          memoryAccessToken = token;
          tokenExpiryTime = expiryTime;
          if (userDataStr) {
            memoryUserData = JSON.parse(userDataStr);
          }
          restored = true;
        }
      }
    } catch (e) {
      // Ignore
    }

    return restored;
  }

  // Compatibility methods
  static setRefreshTokenId(refreshTokenId) {
    // Backend handles refresh tokens via httpOnly cookies
  }

  static getRefreshTokenId() {
    return null;
  }
}

export default TokenManager;