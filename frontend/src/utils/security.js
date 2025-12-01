import TokenManager from '../services/tokenManager';

// Sécurité XSS - Nettoyage du contenu
export function sanitizeHTML(input) {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Prévention XSS pour les textes
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Vérification des permissions de l'utilisateur
export function hasPermission(userRole, requiredRole) {
  const permissions = {
    admin: ['admin', 'buyer', 'supplier', 'accountant', 'viewer'],
    buyer: ['buyer', 'supplier'],
    supplier: ['supplier'],
    accountant: ['accountant'],
    viewer: ['viewer']
  };
  return permissions[userRole]?.includes(requiredRole) || false;
}

// Surveillance de l'inactivité
// Timeout: 3 heures (10800000ms) - Basé sur les meilleures pratiques de sécurité pour les applications B2B
export function setupInactivityTimer(timeout = 3 * 60 * 60 * 1000) {
  let inactivityTimer;
  
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      TokenManager.clearTokens();
      window.location.replace('/login');
    }, timeout);
  };

  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  document.addEventListener('click', resetTimer);
  
  resetTimer();
  
  return () => {
    document.removeEventListener('mousemove', resetTimer);
    document.removeEventListener('keypress', resetTimer);
    document.removeEventListener('click', resetTimer);
  };
}
