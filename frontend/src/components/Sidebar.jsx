import { useState } from 'react';
import { Drawer, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import institutionalTheme from '../theme/theme';
import { THEME_COLORS } from './themeHelpers';
import UpgradeModal from './UpgradeModal';
import { useSubscriptionTier } from '../hooks/useSubscriptionTier';

// Import sub-components
import SidebarHeader from './Sidebar/SidebarHeader';
import SidebarMenuList from './Sidebar/SidebarMenuList';
import SidebarFooter from './Sidebar/SidebarFooter';
import { getMenuByRole } from './Sidebar/SidebarMenus';

const DRAWER_WIDTH = 280;

// Define a default menu in case user role is not available
const DEFAULT_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardIcon',
    link: '/dashboard',
  },
];


/**
 * Main Sidebar component - Orchestrates sidebar layout and state
 * Handles menu rendering for all user roles
 */
export default function Sidebar({ user, onLogout }) {
  const theme = institutionalTheme;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { checkFeatureAccess, handleLockedFeatureClick, closeUpgradeModal, upgradeModal } =
    useSubscriptionTier(user?.subscription);

  // Safe menu retrieval with fallback
  const menu = user?.role ? getMenuByRole(user.role, user.permissions) : DEFAULT_MENU;

  // Ensure menu is always an array
  const safeMenu = Array.isArray(menu) ? menu : DEFAULT_MENU;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SidebarHeader user={user} />
      <SidebarMenuList menu={safeMenu} />
      <SidebarFooter onLogout={onLogout} />
      {upgradeModal && <UpgradeModal {...upgradeModal} onClose={closeUpgradeModal} />}
    </Box>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: '12px',
          top: '76px',
          zIndex: 100,
          backgroundColor: theme.palette.primary.main,
          color: '#ffffff',
          '&:hover': { backgroundColor: '#0d47a1' },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: THEME_COLORS.bgPaper,
            borderRight: '1px solid #e0e0e0',
            marginTop: '64px',
            transition: 'all 0.3s ease-in-out',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: THEME_COLORS.bgPaper,
            marginTop: '64px',
            transition: 'transform 0.3s ease-in-out',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Page Content Spacer - Desktop Only */}
      <Box
        sx={{
          width: DRAWER_WIDTH,
          display: { xs: 'none', md: 'block' },
          transition: 'all 0.3s ease-in-out',
          flexShrink: 0,
        }}
      />
    </>
  );
}