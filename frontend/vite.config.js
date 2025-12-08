import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    hmr: {
      overlay: true,
      timeout: 30000,
      clientPort: 5000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
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
        rewrite: (path) => path,
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
    // Optimize chunk strategy for faster first load
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core dependencies
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
          // Split large components
          if (id.includes('components/Sidebar') || id.includes('components/UnifiedHeader')) {
            return 'heavy-components';
          }
          // Admin components
          if (id.includes('components/Admin')) {
            return 'admin-components';
          }
          // Pages grouped by feature
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
    // Larger limit for better loading
    chunkSizeWarningLimit: 1000,
    // Minify aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // Enable source maps only in dev
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Increase report size
    reportCompressedSize: false,
    // Optimize lib entry point
    lib: undefined,
  },
  // Optimize resolution
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
  // Optimize dependency pre-bundling
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