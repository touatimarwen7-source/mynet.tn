/**
 * Token Manager Service
 * Gestion centralisée des tokens JWT
 */
class TokenManager {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'auth_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_KEY = 'user_data';
  }

  // Gestion du token d'accès
  setAccessToken(token) {
    if (token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Gestion du token de rafraîchissement
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Gestion des données utilisateur
  setUser(user) {
    if (!user) {
      console.warn('TokenManager: Attempted to set null/undefined user');
      return;
    }

    // Normalize userId and id
    const normalizedUser = {
      ...user,
      userId: user.userId || user.id,
      id: user.id || user.userId
    };

    if (!normalizedUser.userId && !normalizedUser.id) {
      console.error('TokenManager: User data missing both userId and id:', user);
      return;
    }

    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
      // Reduce console spam - only log in development
      if (import.meta.env.DEV) {
        console.log('TokenManager: User data stored successfully');
      }
    } catch (error) {
      console.error('TokenManager: Error storing user data:', error);
    }
  }

  getUser() {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) {
        console.log('TokenManager: No user data in storage');
        return null;
      }

      const user = JSON.parse(userJson);
      console.log('TokenManager: User data retrieved:', user?.userId);
      return user;
    } catch (error) {
      console.error('TokenManager: Error retrieving user data:', error);
      return null;
    }
  }

  // Gestion complète des tokens
  manageTokens(accessToken, refreshToken, userData) {
    if (accessToken) this.setAccessToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
    if (userData) this.setUser(userData);
  }

  // Alias for compatibility
  setUserData(userData) {
    this.setUser(userData);
  }

  // Nettoyage complet
  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Vérification d'authentification
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Extraire les données du token JWT
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

  // Vérifier si le token est valide (non expiré)
  isTokenValid() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.getUserFromToken(token);
      if (!decoded || !decoded.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Vérifier si le token doit être rafraîchi (< 2 min avant expiration)
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
      return false;
    }
  }

  // Obtenir le temps restant avant expiration (en secondes)
  getTimeUntilExpiry() {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = this.getUserFromToken(token);
      if (!decoded || !decoded.exp) return 0;

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - now);
    } catch (error) {
      return 0;
    }
  }

  // New method to handle potential storage inconsistencies and add retry
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

  static restoreFromStorage() {
    try {
      // Try sessionStorage first
      const stored = sessionStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.userData = parsed;
        return parsed;
      }

      // Fallback to localStorage
      const localStored = localStorage.getItem('auth_user');
      if (localStored) {
        const parsed = JSON.parse(localStored);
        this.userData = parsed;
        // Restore to sessionStorage
        sessionStorage.setItem('auth_user', localStored);
        return parsed;
      }
    } catch (e) {
      console.error('TokenManager: Failed to restore from storage:', e);
      // Clear corrupted data
      this.clearTokens();
    }
    console.log('TokenManager: No user data in storage');
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