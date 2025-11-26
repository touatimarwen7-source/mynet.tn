import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  Button,
  LineChart,
  BarChart,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import ErrorIcon from '@mui/icons-material/Error';
import UserRoleManagement from '../components/Admin/UserRoleManagement';
import ContentManager from '../components/Admin/ContentManager';
import ServicesManager from '../components/Admin/ServicesManager';
import SystemConfig from '../components/Admin/SystemConfig';
import AdminAnalytics from '../components/Admin/AdminAnalytics';
import { setPageTitle } from '../utils/pageTitle';
import { adminAPI } from '../api';

export default function SuperAdminDashboard() {
  const theme = institutionalTheme;
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTenders: 0,
    systemHealth: 0,
    errorRate: 0,
    responseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational');

  useEffect(() => {
    setPageTitle('Centre de Contrôle Total - Super Admin');
  }, []);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const statsRes = await adminAPI.getStatistics();
      const data = statsRes.data?.data || {};
      
      setStats({
        totalUsers: data.total_users || 0,
        activeTenders: data.active_tenders || 0,
        systemHealth: data.system_health || 95,
        errorRate: data.error_rate || 0.2,
        responseTime: data.avg_response_time || 145,
      });

      setSystemStatus(data.system_health > 90 ? 'operational' : data.system_health > 70 ? 'degraded' : 'critical');
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      label: 'Gestion des Utilisateurs et Sécurité', 
      icon: <SecurityIcon />, 
      component: <UserRoleManagement />,
      description: 'Voir tous les utilisateurs, modifier les rôles, bloquer/débloquer les comptes'
    },
    { 
      label: 'Gestion du Contenu Dynamique', 
      icon: <ArticleIcon />, 
      component: <ContentManager />,
      description: 'Modifier les pages statiques, gérer les fichiers et documents'
    },
    { 
      label: 'Gestion des Services et Plans', 
      icon: <BuildIcon />, 
      component: <ServicesManager />,
      description: 'Gérer les services généraux, les plans d\'abonnement'
    },
    { 
      label: 'Paramètres Système', 
      icon: <SettingsIcon />, 
      component: <SystemConfig />,
      description: 'Mode maintenance, Feature Toggles, Rate Limits'
    },
    { 
      label: 'Surveillance et Analyse', 
      icon: <AnalyticsIcon />, 
      component: <AdminAnalytics />,
      description: 'Statistiques en direct, journaux d\'activité, surveillance'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  const StatCard = ({ label, value, subtitle, icon, color, trend }) => (
    <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
      <CardContent sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <Box sx={{ fontSize: '28px', color }}>{icon}</Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 600, color }}>
              {value}
            </Typography>
            {trend && (
              <Typography sx={{ fontSize: '11px', color: trend > 0 ? '#4caf50' : '#f44336' }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
        </Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.text.primary }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

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
            Super Admin Uniquement - Vue d'ensemble système
          </Typography>
          
          <Alert 
            severity={systemStatus === 'operational' ? 'success' : systemStatus === 'degraded' ? 'warning' : 'error'}
            sx={{ 
              marginBottom: '24px',
              backgroundColor: systemStatus === 'operational' ? '#e8f5e9' : systemStatus === 'degraded' ? '#FFF3E0' : '#ffebee',
              borderColor: systemStatus === 'operational' ? '#4caf50' : systemStatus === 'degraded' ? '#FFB74D' : '#f44336',
              color: systemStatus === 'operational' ? '#1b5e20' : systemStatus === 'degraded' ? '#E65100' : '#c62828'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <strong>Statut Système: {systemStatus === 'operational' ? 'Opérationnel' : systemStatus === 'degraded' ? 'Dégradé' : 'Critique'}</strong>
                <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
                  Tous les changements ici affectent l'ensemble de la plateforme
                </Typography>
              </Box>
              <Chip 
                label={systemStatus} 
                color={systemStatus === 'operational' ? 'success' : systemStatus === 'degraded' ? 'warning' : 'error'}
                variant="filled"
              />
            </Box>
          </Alert>
        </Box>

        {/* System Stats Grid */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              label="Total Utilisateurs" 
              value={stats.totalUsers}
              subtitle="Utilisateurs actifs"
              icon={<PeopleIcon />}
              color="#1976d2"
              trend={5.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              label="Appels Actifs" 
              value={stats.activeTenders}
              subtitle="En cours"
              icon={<ArticleIcon />}
              color="#388e3c"
              trend={3.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              label="Santé Système" 
              value={`${stats.systemHealth}%`}
              subtitle="État général"
              icon={<TrendingUpIcon />}
              color={stats.systemHealth > 90 ? '#388e3c' : stats.systemHealth > 70 ? '#f57c00' : '#d32f2f'}
              trend={-0.8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              label="Taux d'Erreur" 
              value={`${stats.errorRate}%`}
              subtitle="Dernière heure"
              icon={<ErrorIcon />}
              color={stats.errorRate < 1 ? '#388e3c' : stats.errorRate < 5 ? '#f57c00' : '#d32f2f'}
              trend={-0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              label="Temps de Réponse" 
              value={`${stats.responseTime}ms`}
              subtitle="Moyenne"
              icon={<StorageIcon />}
              color="#7b1fa2"
              trend={-2.1}
            />
          </Grid>
        </Grid>

        {/* Main Content - Tabs */}
        <Card sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Tabs
            value={currentTab}
            onChange={(e, value) => setCurrentTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #E0E0E0',
              backgroundColor: '#fafafa',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: '#616161',
                padding: '12px 16px',
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: '#F0F4FF'
                }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '14px', color: '#616161' }}>
                {tabs[currentTab].description}
              </Typography>
            </Box>
            {tabs[currentTab].component}
          </Box>
        </Card>

        {/* Quick Links */}
        <Card sx={{ mt: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
              Liens d'Accès Rapide
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Gestion des Utilisateurs"
                  secondary="Voir et gérer tous les utilisateurs du système"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logs de Sécurité"
                  secondary="Consulter les journaux d'audit et d'accès"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Rapports Analytics"
                  secondary="Analyser les tendances et les performances"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Configuration Système"
                  secondary="Paramètres avancés et maintenance"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* System Health Details */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                  Ressources Système
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation CPU"
                      secondary="45.2%"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Mémoire"
                      secondary="62.8% (5.2GB / 8GB)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Stockage"
                      secondary="78.4% utilisé"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Connexions BD"
                      secondary="8/20 actives"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                  Statut des Services
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary="API Server"
                      secondary="Opérationnel"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Base de Données"
                      secondary="Opérationnel"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Cache Redis"
                      secondary="Opérationnel"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Email Service"
                      secondary="Opérationnel"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
