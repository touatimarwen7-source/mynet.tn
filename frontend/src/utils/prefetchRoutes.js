/**
 * 🚀 Route Prefetching Utility
 * Prefetch important routes to improve perceived performance
 * Preload routes user is likely to visit next
 */

export const prefetchRoute = (path) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
};

export const preloadRoute = (path) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = path;
  link.as = 'script';
  document.head.appendChild(link);
};

/**
 * Prefetch routes based on user role
 */
export const prefetchRoleBasedRoutes = (role) => {
  const buyerRoutes = [
    '/tenders',
    '/tender/create',
    '/my-tenders',
    '/dashboard'
  ];

  const supplierRoutes = [
    '/tenders',
    '/my-offers',
    '/supplier-dashboard',
    '/invoices'
  ];

  const adminRoutes = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/statistics'
  ];

  const routes = role === 'buyer' ? buyerRoutes : role === 'supplier' ? supplierRoutes : adminRoutes;
  routes.forEach(route => prefetchRoute(route));
};

/**
 * Prefetch images and fonts
 */
export const prefetchAssets = () => {
  // Prefetch critical images
  const images = [
    '/logo.png',
    '/hero-image.jpg'
  ];

  images.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = img;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch API endpoints
 */
export const prefetchAPI = (endpoint) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fetch(endpoint, { method: 'HEAD' }).catch(() => {});
    });
  } else {
    setTimeout(() => {
      fetch(endpoint, { method: 'HEAD' }).catch(() => {});
    }, 2000);
  }
};

/**
 * Comprehensive prefetch strategy
 */
export const initializePrefetch = (user) => {
  // Prefetch user's primary routes
  if (user) {
    prefetchRoleBasedRoutes(user.role);
  }

  // Prefetch static assets
  prefetchAssets();

  // Prefetch common API endpoints
  if (user) {
    prefetchAPI('/api/user/profile');
    prefetchAPI('/api/notifications');
  }
};
