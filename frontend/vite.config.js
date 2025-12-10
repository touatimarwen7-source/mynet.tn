import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      '.replit.dev',
      '.repl.co',
      '.riker.replit.dev',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ Vite Proxy Error:', {
              message: err.message,
              url: req.url,
              method: req.method
            });
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Proxy Error',
              message: 'Backend is not reachable',
              details: err.message
            }));
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Vite → Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Backend → Vite:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    hmr: {
      protocol: 'wss',
      host: undefined,
      clientPort: 443,
      timeout: 5000,
      overlay: false
    }
  },
  watch: {
    usePolling: false,
    ignored: ['**/node_modules/**', '**/dist/**']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});