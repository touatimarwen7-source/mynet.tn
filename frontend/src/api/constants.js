
// API Base URL - Replit optimized configuration
const getBackendUrl = () => {
  // في بيئة المتصفح، استخدم window.location للحصول على العنوان الصحيح
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol; // http: أو https:
    const hostname = window.location.hostname; // العنوان الفعلي
    
    // إنشاء URL للـ Backend على نفس الـ hostname مع port 3000
    const backendUrl = `${protocol}//${hostname}:3000/api`;
    
    console.log('✅ Backend URL configured:', backendUrl);
    return backendUrl;
  }
  
  // Fallback (لن يحدث في المتصفح)
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getBackendUrl();
