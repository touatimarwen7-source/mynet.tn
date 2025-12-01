import { createContext, useState, useEffect, useContext } from 'react';
import TokenManager from '../services/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = TokenManager.getUserFromToken();
    if (userData && TokenManager.getAccessToken()) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);

    const handleAuthChange = () => {
      const newUserData = TokenManager.getUserFromToken();
      setUser(newUserData);
      setIsAuthenticated(!!newUserData);
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const value = { user, isAuthenticated, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};