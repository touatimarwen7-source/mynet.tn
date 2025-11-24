import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * 🚀 Heavy Components Wrapper
 * Dynamic imports for large components to reduce initial bundle
 * Sidebar: 493 lines - loaded on demand
 * UnifiedHeader: 373 lines - loaded on demand
 */

const SidebarLazy = lazy(() => import('./Sidebar'));
const UnifiedHeaderLazy = lazy(() => import('./UnifiedHeader'));

const ComponentLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

export const SidebarWrapper = ({ user, onLogout }) => (
  <Suspense fallback={<ComponentLoader />}>
    <SidebarLazy user={user} onLogout={onLogout} />
  </Suspense>
);

export const HeaderWrapper = (props) => (
  <Suspense fallback={<ComponentLoader />}>
    <UnifiedHeaderLazy {...props} />
  </Suspense>
);
