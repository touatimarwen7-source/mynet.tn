// 🚀 LAZY LOADING CONFIG
// Add this to vite.config.js to enable code splitting and lazy loading
// Already configured in main vite.config.js - this is for reference

const lazyLoadingConfig = {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'mui': [
            '@mui/material',
            '@mui/icons-material',
          ],
          'utils': [
            'axios',
            'i18next',
          ],
        }
      }
    }
  },
  
  // Lazy load routes with dynamic imports
  routes: {
    // Use React.lazy() with Suspense for dynamic imports:
    // const CreateTender = React.lazy(() => import('./pages/CreateTender'));
    // const CreateBid = React.lazy(() => import('./pages/CreateBid'));
    // Then wrap in <Suspense fallback={<LoadingSpinner />}>
  }
};

export default lazyLoadingConfig;
