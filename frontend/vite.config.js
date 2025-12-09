import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    hmr: {
      overlay: true,
      timeout: 5000,
      clientPort: 443,
      protocol: 'wss',
    },
    watch: {
      usePolling: false,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/logs/**', '**/backups/**'],
    },
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 http://localhost:5000 https://*.replit.dev:* https://*.replit.dev ws://localhost:* ws://*.replit.dev:* wss://*.replit.dev:* wss:; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'",
    },
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3000',
        changeOrigin: true,
        secure: false,
        ws: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('⚠️ Proxy error:', err.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Backend server is not running on port 3000');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxying:', req.method, req.url, '→ http://0.0.0.0:3000');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Proxy response:', req.method, req.url, proxyRes.statusCode);
          });
        }
      },
      '/socket.io': {
        target: 'ws://0.0.0.0:3000',
        ws: true,
        changeOrigin: true,
      },
    },
    cors: {
      origin: '*',
      credentials: true,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) {
            return 'react-core';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router';
          }
          if (id.includes('node_modules/@mui/material')) {
            return 'mui-core';
          }
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'mui-icons';
          }
          if (id.includes('node_modules/axios')) {
            return 'api';
          }
          if (id.includes('node_modules/i18next')) {
            return 'i18n';
          }
          if (id.includes('node_modules/socket.io-client')) {
            return 'socket';
          }
          if (id.includes('components/Sidebar') || id.includes('components/UnifiedHeader')) {
            return 'heavy-components';
          }
          if (id.includes('components/Admin')) {
            return 'admin-components';
          }
          if (
            id.includes('pages/Tender') ||
            id.includes('pages/Offer') ||
            id.includes('pages/Bid')
          ) {
            return 'tender-pages';
          }
          if (
            id.includes('pages/Invoice') ||
            id.includes('pages/Financial') ||
            id.includes('pages/Budget')
          ) {
            return 'financial-pages';
          }
          if (
            id.includes('pages/Admin') ||
            id.includes('pages/SuperAdmin') ||
            id.includes('pages/User')
          ) {
            return 'admin-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false,
    lib: undefined,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@contexts': '/src/contexts',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'i18next',
      'react-i18next',
    ],
    exclude: ['@vitest/ui'],
  },
});