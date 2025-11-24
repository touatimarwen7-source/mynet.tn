import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000
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
          if (id.includes('pages/Tender') || id.includes('pages/Offer') || id.includes('pages/Bid')) {
            return 'tender-pages';
          }
          if (id.includes('pages/Invoice') || id.includes('pages/Financial') || id.includes('pages/Budget')) {
            return 'financial-pages';
          }
          if (id.includes('pages/Admin') || id.includes('pages/SuperAdmin') || id.includes('pages/User')) {
            return 'admin-pages';
          }
        }
      }
    },
    // Larger limit for better loading
    chunkSizeWarningLimit: 1000,
    // Minify aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    // Enable source maps only in dev
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Increase report size
    reportCompressedSize: false,
    // Optimize lib entry point
    lib: undefined
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
      '@contexts': '/src/contexts'
    }
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
      'react-i18next'
    ],
    exclude: ['@vitest/ui']
  }
})
