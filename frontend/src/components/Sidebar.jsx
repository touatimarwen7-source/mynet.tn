import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Button,
  Avatar,
  Typography,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { setPageTitle } from '../utils/pageTitle';
import UpgradeModal from './UpgradeModal';
import { useSubscriptionTier } from '../hooks/useSubscriptionTier';

const DRAWER_WIDTH = 280;

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { checkFeatureAccess, handleLockedFeatureClick, closeUpgradeModal, upgradeModal } = useSubscriptionTier(user?.subscription);

  // Menus par rôle
  const buyerMenu = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      path: '/buyer-dashboard',
      featureKey: 'dashboard',
      subItems: []
    },
    {
      id: 'tenders',
      label: 'Appels d\'Offres',
      subItems: [
        { label: 'Actifs', path: '/buyer-active-tenders', featureKey: 'browsetenders' },
        { label: 'Créer un Appel', path: '/create-tender', featureKey: 'createtender' },
        { label: 'Soumissions', path: '/monitoring-submissions', featureKey: 'browsetenders' },
        { label: 'Évaluation', path: '/tender-evaluation', featureKey: 'analytics' },
        { label: 'Attribution', path: '/tender-awarding', featureKey: 'analytics' },
        { label: 'Notifications', path: '/award-notifications', featureKey: 'analytics' }
      ]
    },
    {
      id: 'finances',
      label: 'Finances',
      subItems: [
        { label: 'Factures', path: '/invoices', featureKey: 'invoices' },
        { label: 'Génération', path: '/invoice-generation', featureKey: 'invoices' },
        { label: 'Budgets', path: '/budgets', featureKey: 'budgets' },
        { label: 'Rapports Financiers', path: '/financial-reports', featureKey: 'customreports' }
      ]
    },
    {
      id: 'operations',
      label: 'Opérations',
      subItems: [
        { label: 'Contrats', path: '/contracts', featureKey: 'operations' },
        { label: 'Livraisons', path: '/deliveries', featureKey: 'operations' },
        { label: 'Performance', path: '/performance', featureKey: 'operations' },
        { label: 'Litiges', path: '/disputes', featureKey: 'operations' }
      ]
    },
    {
      id: 'team',
      label: 'Équipe',
      subItems: [
        { label: 'Gestion d\'équipe', path: '/team-management', featureKey: 'teammanagement' },
        { label: 'Permissions', path: '/team-permissions', featureKey: 'teammanagement' },
        { label: 'Rôles', path: '/team-roles', featureKey: 'teammanagement' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      path: '/notifications',
      featureKey: 'notifications',
      subItems: []
    },
    {
      id: 'profile',
      label: 'Profil',
      featureKey: 'profile',
      subItems: [
        { label: 'Paramètres', path: '/profile', featureKey: 'profile' },
        { label: 'Sécurité', path: '/security', featureKey: 'profile' },
        { label: 'Préférences', path: '/preferences', featureKey: 'profile' }
      ]
    }
  ];

  const supplierMenu = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      path: '/supplier-search',
      featureKey: 'dashboard',
      subItems: []
    },
    {
      id: 'tenders',
      label: 'Appels d\'Offres',
      subItems: [
        { label: 'Parcourir', path: '/tenders', featureKey: 'browsetenders' },
        { label: 'Mes Offres', path: '/my-offers', featureKey: 'myoffers' },
        { label: 'Soumises', path: '/my-offers?status=submitted', featureKey: 'myoffers' },
        { label: 'Évaluées', path: '/my-offers?status=evaluated', featureKey: 'myoffers' }
      ]
    },
    {
      id: 'catalog',
      label: 'Catalogue',
      subItems: [
        { label: 'Gestion Produits', path: '/supplier-products', featureKey: 'catalog' },
        { label: 'Gestion Services', path: '/supplier-services', featureKey: 'catalog' },
        { label: 'Visibilité', path: '/supplier-catalog', featureKey: 'catalog' }
      ]
    },
    {
      id: 'finances',
      label: 'Finances',
      subItems: [
        { label: 'Factures', path: '/supplier-invoices', featureKey: 'invoices' },
        { label: 'Paiements', path: '/supplier-payments', featureKey: 'invoices' },
        { label: 'Rapports', path: '/supplier-reports', featureKey: 'customreports' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      path: '/notifications',
      featureKey: 'notifications',
      subItems: []
    },
    {
      id: 'profile',
      label: 'Profil',
      featureKey: 'profile',
      subItems: [
        { label: 'Paramètres', path: '/profile', featureKey: 'profile' },
        { label: 'Sécurité', path: '/security', featureKey: 'profile' },
        { label: 'Entreprise', path: '/company-info', featureKey: 'profile' }
      ]
    }
  ];

  const adminMenu = [
    {
      id: 'dashboard',
      label: 'Tableau de Contrôle',
      path: '/admin',
      subItems: []
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      subItems: [
        { label: 'Gestion', path: '/admin/users' },
        { label: 'Rôles', path: '/admin/roles' },
        { label: 'Autorisations', path: '/admin/permissions' }
      ]
    },
    {
      id: 'tenders',
      label: 'Appels d\'Offres',
      subItems: [
        { label: 'Tous', path: '/admin/tenders' },
        { label: 'Modération', path: '/admin/tenders-moderation' },
        { label: 'Archivage', path: '/admin/archive-management' }
      ]
    },
    {
      id: 'system',
      label: 'Système',
      subItems: [
        { label: 'Santé', path: '/health-monitoring' },
        { label: 'Audit', path: '/audit-log-viewer' },
        { label: 'Configurations', path: '/admin/settings' }
      ]
    },
    {
      id: 'billing',
      label: 'Facturation',
      subItems: [
        { label: 'Abonnements', path: '/subscription-tiers' },
        { label: 'Factures', path: '/admin/invoices' },
        { label: 'Contrôle des Fonctionnalités', path: '/feature-control' }
      ]
    },
    {
      id: 'profile',
      label: 'Profil Admin',
      subItems: [
        { label: 'Paramètres', path: '/profile' },
        { label: 'Sécurité', path: '/security' }
      ]
    }
  ];

  const getMenuForRole = () => {
    switch (user?.role) {
      case 'buyer': return buyerMenu;
      case 'supplier': return supplierMenu;
      case 'admin': return adminMenu;
      default: return [];
    }
  };

  const menu = getMenuForRole();

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleNavigation = (path, label) => {
    setPageTitle(label);
    navigate(path);
  };

  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ padding: '24px 16px', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Avatar sx={{ width: 36, height: 36, backgroundColor: '#1565c0', fontSize: '16px', fontWeight: 600 }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'Utilisateur'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#616161' }}>
              {user?.role === 'buyer' ? 'Acheteur' : user?.role === 'supplier' ? 'Fournisseur' : 'Admin'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {menu.map(item => (
          <Box key={item.id}>
            {item.subItems.length > 0 ? (
              <>
                <ListItemButton
                  onClick={() => toggleMenu(item.id)}
                  sx={{
                    padding: '12px 16px',
                    margin: '4px 8px',
                    borderRadius: '4px',
                    color: '#212121',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '14px', fontWeight: 500 } }}
                  />
                  {expandedMenus[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                <Collapse in={expandedMenus[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem, idx) => (
                      <ListItemButton
                        key={idx}
                        onClick={() => handleNavigation(subItem.path, subItem.label)}
                        sx={{
                          paddingLeft: '48px',
                          paddingRight: '16px',
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          marginRight: '8px',
                          marginLeft: '8px',
                          marginTop: '2px',
                          marginBottom: '2px',
                          borderRadius: '4px',
                          backgroundColor: isMenuItemActive(subItem.path) ? '#e3f2fd' : 'transparent',
                          borderLeft: isMenuItemActive(subItem.path) ? '4px solid #1565c0' : 'none',
                          paddingLeft: isMenuItemActive(subItem.path) ? '44px' : '48px',
                          color: isMenuItemActive(subItem.path) ? '#1565c0' : '#616161',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#1565c0',
                          },
                        }}
                      >
                        <ListItemText
                          primary={subItem.label}
                          sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '13px', fontWeight: 400 } }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItemButton
                onClick={() => handleNavigation(item.path, item.label)}
                sx={{
                  padding: '12px 16px',
                  margin: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isMenuItemActive(item.path) ? '#e3f2fd' : 'transparent',
                  borderLeft: isMenuItemActive(item.path) ? '4px solid #1565c0' : 'none',
                  paddingLeft: isMenuItemActive(item.path) ? '12px' : '16px',
                  color: isMenuItemActive(item.path) ? '#1565c0' : '#212121',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    color: '#1565c0',
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '14px', fontWeight: 500 } }}
                />
              </ListItemButton>
            )}
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', padding: '16px' }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={onLogout}
          startIcon={<LogoutIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#c62828',
            '&:hover': { backgroundColor: '#ad1457' },
          }}
        >
          Se Déconnecter
        </Button>
      </Box>

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
          backgroundColor: '#1565c0',
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
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            marginTop: '64px',
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
            backgroundColor: '#ffffff',
            marginTop: '64px',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Page Content Spacer - Desktop Only */}
      <Box sx={{ width: DRAWER_WIDTH, display: { xs: 'none', md: 'block' } }} />
    </>
  );
}
