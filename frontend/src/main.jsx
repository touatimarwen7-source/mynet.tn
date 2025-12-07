import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './i18n';

import App from './App.jsx';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';

import CSRFProtection from './utils/csrfProtection';
import tokenManager from './services/tokenManager';
import { initializeSentry } from './config/sentry';
import analyticsTracking from './utils/analyticsTracking';

// Initialize error tracking (non-blocking)
try {
  initializeSentry();
} catch (error) {
  console.error('Failed to initialize Sentry:', error);
}

// Initialize security features
try {
  CSRFProtection.initialize();
} catch (error) {
  console.error('Failed to initialize CSRF protection:', error);
}

// ✅ Initialisation de la gestion des tokens au démarrage
try {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  if (token && userData) {
    tokenManager.manageTokens(token, null, JSON.parse(userData));
  } else {
    tokenManager.clearTokens();
  }
} catch (error) {
  console.error('Échec de la gestion des tokens:', error);
  tokenManager.clearTokens();
}

// Initialize analytics
window.analytics = analyticsTracking;

// Render application
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppProvider>
  </StrictMode>
);