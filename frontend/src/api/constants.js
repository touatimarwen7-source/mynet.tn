

// API Base URL - استخدام Vite Proxy (relative path)
// في بيئة development، Vite سيوجه الطلبات إلى Backend تلقائياً
// في production، يجب تكوين reverse proxy (nginx/caddy)
export const API_BASE_URL = '/api';

console.log('✅ API configured to use Vite proxy:', API_BASE_URL);
