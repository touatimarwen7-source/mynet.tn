import { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab, Typography, Alert } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import UserRoleManagement from '../components/Admin/UserRoleManagement';
import AdminAnalytics from '../components/Admin/AdminAnalytics';
import { setPageTitle } from '../utils/pageTitle';

/**
 * Admin Dashboard - Limited Permissions
 * Admin has limited permissions only:
 * - View users (no role editing)
 * - View statistics
 * - Cannot modify system or delete data
 */
export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    setPageTitle('Tableau de Bord - Admin');
  }, []);

  const tabs = [
    { 
      label: 'Gestion des Utilisateurs', 
      icon: <SecurityIcon />, 
      component: <UserRoleManagement />,
      description: 'Voir les utilisateurs et les informations de base (permissions limitées)',
      superAdminOnly: false
    },
    { 
      label: 'Statistiques', 
      icon: <AnalyticsIcon />, 
      component: <AdminAnalytics />,
      description: 'Voir les statistiques et rapports de base',
      superAdminOnly: false
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#0056B3',
              marginBottom: '8px',
            }}
          >
            Tableau de Bord - Admin
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#616161',
              marginBottom: '16px',
            }}
          >
            Permissions Limitées - Admin
          </Typography>
          
          <Alert 
            severity="info" 
            sx={{ 
              marginBottom: '24px',
              backgroundColor: '#E3F2FD',
              borderColor: '#90CAF9',
              color: '#1565C0'
            }}
          >
            Vous avez des permissions limitées déléguées par le Super Admin. Pour accéder à tous les outils de contrôle, contactez le Super Admin.
          </Alert>
        </Box>

        {/* Main Content */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Tabs
            value={currentTab}
            onChange={(e, value) => setCurrentTab(value)}
            sx={{
              borderBottom: '1px solid #E0E0E0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: '#616161',
                padding: '12px 16px',
                '&.Mui-selected': {
                  color: '#0056B3',
                  backgroundColor: '#F0F4FF'
                }
              }
            }}
          >
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minWidth: 'auto' }}
                title={tab.description}
              />
            ))}
          </Tabs>

          {/* Tab Description */}
          <Box sx={{ padding: '16px 24px', borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA' }}>
            <Typography sx={{ fontSize: '12px', color: '#666666' }}>
              📌 {tabs[currentTab].description}
            </Typography>
          </Box>

          {/* Tab Content */}
          <Box sx={{ padding: '24px' }}>
            {tabs[currentTab].component}
          </Box>
        </Box>

        <Box sx={{ marginTop: '32px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Typography sx={{ fontSize: '12px', color: '#999999', lineHeight: '1.6' }}>
            <strong>Note:</strong> En tant qu'Admin, vous avez des permissions limitées uniquement. 
            Pour accéder au contrôle complet (Total Control Hub), vous devez être Super Admin.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
