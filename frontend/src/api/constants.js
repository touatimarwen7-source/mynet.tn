

// API Base URL - استخدام Vite Proxy (relative path)
// في بيئة development، Vite سيوجه الطلبات إلى Backend تلقائياً
// في production، يجب تكوين reverse proxy (nginx/caddy)
export const API_BASE_URL = '/api';

if (import.meta.env.DEV) {
  console.log('🔧 Development Mode: Using Vite Proxy at', API_BASE_URL);
}
