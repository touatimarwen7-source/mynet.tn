// أمان الـ XSS - تنقية المحتوى
export function sanitizeHTML(input) {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// منع XSS في النصوص
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

// التحقق من صلاحيات المستخدم
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

// مراقبة الخمول
export function setupInactivityTimer(timeout = 15 * 60 * 1000) {
  let inactivityTimer;
  
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.warn('انتهاء الجلسة بسبب الخمول');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
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
