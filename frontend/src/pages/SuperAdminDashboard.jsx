import { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab, Typography, Alert } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import UserRoleManagement from '../components/Admin/UserRoleManagement';
import ContentManager from '../components/Admin/ContentManager';
import ServicesManager from '../components/Admin/ServicesManager';
import SystemConfig from '../components/Admin/SystemConfig';
import AdminAnalytics from '../components/Admin/AdminAnalytics';
import { setPageTitle } from '../utils/pageTitle';

/**
 * Centre de Contrôle Total - Super Admin Dashboard
 * Full Control Powers
 * 
 * 1. User & Security Management
 * 2. Dynamic Content Management
 * 3. System Settings Control
 * 4. Monitoring & Analytics
 */
export default function SuperAdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    setPageTitle('Centre de Contrôle Total - Super Admin');
  }, []);

  const tabs = [
    { 
      label: 'Gestion des Utilisateurs et Sécurité', 
      icon: <SecurityIcon />, 
      component: <UserRoleManagement />,
      description: 'Voir tous les utilisateurs, modifier les rôles, bloquer/débloquer les comptes, réinitialiser les mots de passe'
    },
    { 
      label: 'Gestion du Contenu Dynamique', 
      icon: <ArticleIcon />, 
      component: <ContentManager />,
      description: 'Modifier les pages statiques, gérer les fichiers, images et documents'
    },
    { 
      label: 'Gestion des Services et Plans', 
      icon: <BuildIcon />, 
      component: <ServicesManager />,
      description: 'Gérer les services généraux (Feature Flags), les plans d\'abonnement, les services des fournisseurs'
    },
    { 
      label: 'Paramètres Système', 
      icon: <SettingsIcon />, 
      component: <SystemConfig />,
      description: 'Mode maintenance, Feature Toggles, Rate Limits, paramètres du cache'
    },
    { 
      label: 'Surveillance et Analyse', 
      icon: <AnalyticsIcon />, 
      component: <AdminAnalytics />,
      description: 'Statistiques en direct, journaux d\'activité, surveillance des ressources'
    }
  ];

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: theme.palette.primary.main,
              marginBottom: '8px',
            }}
          >
            Centre de Contrôle Total
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#616161',
              marginBottom: '16px',
            }}
          >
            Super Admin Uniquement
          </Typography>
          
          <Alert 
            severity="warning" 
            sx={{ 
              marginBottom: '24px',
              backgroundColor: '#FFF3E0',
              borderColor: '#FFB74D',
              color: '#E65100'
            }}
          >
            Vous utilisez un compte Super Admin - Tous les changements ici affectent l\'ensemble de la plateforme
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
                  color: theme.palette.primary.main,
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
            <Typography sx={{ fontSize: '12px', color: theme.palette.text.secondary }}>
              📌 {tabs[currentTab].description}
            </Typography>
          </Box>

          {/* Tab Content */}
          <Box sx={{ padding: '24px' }}>
            {tabs[currentTab].component}
          </Box>
        </Box>

        {/* Footer Info */}
        <Box sx={{ marginTop: '32px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Typography sx={{ fontSize: '12px', color: '#999999', lineHeight: '1.6' }}>
            <strong>Note Importante:</strong> Super Admin possède des permissions complètes pour gérer l'ensemble de la plateforme. 
            Super Admin n'intervient pas dans le cycle d'appel d'offres (Tender Cycle) - c'est réservé aux Acheteurs et Fournisseurs uniquement.
            Admin est un compte délégué par Super Admin avec des permissions limitées.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
