import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import TokenManager from '../services/tokenManager';
import { setupInactivityTimer } from '../utils/security';

/**
 * 🎯 APP CONTEXT
 * Centralized global state management for the entire application
 * Handles: User authentication, app loading, notifications, app settings
 */

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ===== Authentication State =====
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ===== App State =====
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState(null);

  // Simple toast system (no dependency on ToastContext)
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    try {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 5000);
    } catch (error) {
      console.error('Error adding toast:', error);
    }
  }, []);

  // ===== App Settings =====
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appSettings, setAppSettings] = useState({
    language: 'ar',
    theme: 'light',
    notifications: true,
  });

  // ===== Authentication Methods =====

  /**
   * Check authentication status on app load
   */
  const checkAuth = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const token = TokenManager.getAccessToken();
      const storedUser = TokenManager.getUser();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        TokenManager.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthError(error.message);
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Handle user login
   */
  const login = useCallback((userData) => {
    try {
      if (!userData || !userData.userId) {
        console.error('Invalid user data received:', userData);
        throw new Error('Données utilisateur invalides');
      }
      
      console.log('AppContext login: Setting user data:', userData);
      
      // Store in TokenManager
      TokenManager.setUser(userData);
      
      // Update state immediately
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
      
      console.log('AppContext login: User state updated successfully');
      
      // Dispatch event for cross-tab sync
      window.dispatchEvent(new CustomEvent('authChanged', { detail: userData }));
      
      return true;
    } catch (error) {
      console.error('Login error in AppContext:', error);
      setAuthError(error.message);
      return false;
    }
  }, []);

  /**
   * Handle user logout
   */
  const logout = useCallback(() => {
    try {
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      addToast('تم تسجيل الخروج بنجاح', 'success');
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  }, []);

  /**
   * Update user profile
   */
  const updateUser = useCallback(
    (updatedData) => {
      try {
        const newUserData = { ...user, ...updatedData };
        TokenManager.setUserData(newUserData);
        setUser(newUserData);
        return true;
      } catch (error) {
        setAuthError(error.message);
        return false;
      }
    },
    [user]
  );

  // ===== Settings Methods =====

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Update app settings
   */
  const updateSettings = useCallback((newSettings) => {
    setAppSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Change language
   */
  const setLanguage = useCallback((language) => {
    updateSettings({ language });
  }, []);

  /**
   * Change theme
   */
  const setTheme = useCallback((theme) => {
    updateSettings({ theme });
  }, []);

  // ===== App State Methods =====

  /**
   * Set global loading state
   */
  const setLoading = useCallback((loading) => {
    setAppLoading(loading);
  }, []);

  /**
   * Set global error state
   */
  const setError = useCallback((error) => {
    setAppError(error);
    if (error) {
      addToast(error, 'error');
    }
  }, []);

  /**
   * Clear global error
   */
  const clearError = useCallback(() => {
    setAppError(null);
  }, []);

  // ===== Initialization Effects =====

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Set up inactivity timer (3 hours default)
    // The timeout is reset on user activity (mousemove, click, keypress)
    const cleanup = setupInactivityTimer();
    return cleanup;
  }, [isAuthenticated, user]);

  // ===== Listen for auth changes from other tabs =====

  useEffect(() => {
    // Listen for auth changes from login
    const handleAuthChange = (event) => {
      const userData = event.detail;
      console.log('Auth change event received:', userData);
      
      if (userData && userData.userId) {
        console.log('Setting user from auth change event');
        setUser(userData);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        console.log('Clearing user from auth change event');
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  // ===== Context Value =====

  const value = {
    // Authentication State
    user,
    isAuthenticated,
    authLoading,
    authError,

    // App State
    appLoading,
    appError,
    toasts,
    addToast,
    removeToast,

    // App Settings
    sidebarOpen,
    appSettings,

    // Auth Methods
    login,
    logout,
    updateUser,
    checkAuth,

    // Settings Methods
    toggleSidebar,
    updateSettings,
    setLanguage,
    setTheme,

    // App State Methods
    setLoading,
    setError,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * 🪝 useApp Hook
 * Access global app state from any component
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

/**
 * 🪝 useAuth Hook
 * Access authentication state from any component
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    authLoading,
    authError,
    login,
    logout,
    updateUser,
  } = useContext(AppContext);

  if (!AppContext) {
    throw new Error('useAuth must be used within AppProvider');
  }

  return {
    user,
    isAuthenticated,
    authLoading,
    authError,
    login,
    logout,
    updateUser,
  };
};

/**
 * 🪝 useToast Hook
 * Simple toast system integrated in AppContext
 */
export const useToast = () => {
  const { addToast, removeToast, toasts } = useContext(AppContext);

  if (!AppContext) {
    throw new Error('useToast must be used within AppProvider');
  }

  return {
    addToast,
    removeToast,
    toasts,
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  };
};