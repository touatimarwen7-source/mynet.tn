/**
 * مركز التحكم الكامل - Super Admin Dashboard
 * إدارة شاملة للنظام والمستخدمين والخدمات
 * @component
 * @returns {JSX.Element} عنصر لوحة تحكم سوبر أدمين
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Snackbar,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import UserRoleManagement from '../components/Admin/UserRoleManagement';
import ContentManager from '../components/Admin/ContentManager';
import ServicesManager from '../components/Admin/ServicesManager';
import SystemConfig from '../components/Admin/SystemConfig';
import AdminAnalytics from '../components/Admin/AdminAnalytics';
import { setPageTitle } from '../utils/pageTitle';
import { adminAPI } from '../api';
import { logger } from '../utils/logger';
import EnhancedErrorBoundary from '../components/EnhancedErrorBoundary';

/**
 * Snackbar component لعرض الإشعارات
 */
const SnackbarComponent = ({ open, message, severity, onClose }) => (
  <Snackbar 
    open={open} 
    autoHideDuration={6000} 
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

/**
 * Dashboard Content - Super Admin Dashboard Implementation
 */
function SuperAdminDashboardContent() {
  const theme = institutionalTheme;
  const { t } = useTranslation();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTenders: 0,
    systemHealth: 95,
    errorRate: 0.2,
    responseTime: 145,
  });
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setPageTitle(t('dashboard.admin.title'));
  }, [t]);

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
      logger.info('Statistiques du système chargées');
    } catch (error) {
      logger.error('Erreur lors du chargement des statistiques', error);
      setSnackbar({ open: true, message: t('dashboard.admin.statsError'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      label: t('dashboard.admin.usersMgmt'),
      icon: <SecurityIcon />, 
      component: <UserRoleManagement />,
      description: t('dashboard.admin.usersMgmtDesc')
    },
    { 
      label: t('dashboard.admin.contentMgmt'),
      icon: <ArticleIcon />, 
      component: <ContentManager />,
      description: t('dashboard.admin.contentMgmtDesc')
    },
    { 
      label: t('dashboard.admin.servicesMgmt'),
      icon: <BuildIcon />, 
      component: <ServicesManager />,
      description: t('dashboard.admin.servicesMgmtDesc')
    },
    { 
      label: t('dashboard.admin.systemConfig'),
      icon: <SettingsIcon />, 
      component: <SystemConfig />,
      description: t('dashboard.admin.systemConfigDesc')
    },
    { 
      label: t('dashboard.admin.monitoring'),
      icon: <AnalyticsIcon />, 
      component: <AdminAnalytics />,
      description: t('dashboard.admin.monitoringDesc')
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
        <Box sx={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: '32px',
                fontWeight: 600,
                color: theme.palette.primary.main,
                marginBottom: '8px',
              }}
            >
              {t('dashboard.admin.title')}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                color: '#616161',
                marginBottom: '16px',
              }}
            >
              {t('dashboard.admin.subtitle')}
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchSystemStats}
            variant="outlined"
            size="small"
          >
            {t('common.refresh')}
          </Button>
        </Box>
          
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
              <strong>{t('dashboard.admin.systemStatus')}: {t(`dashboard.admin.status.${systemStatus}`)}</strong>
              <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
                {t('dashboard.admin.affectsAll')}
              </Typography>
            </Box>
            <Chip 
              label={systemStatus} 
              color={systemStatus === 'operational' ? 'success' : systemStatus === 'degraded' ? 'warning' : 'error'}
              variant="filled"
            />
          </Box>
        </Alert>

        {/* System Stats Grid */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid xs={12} sm={6} md={2.4}>
            <StatCard 
              label={t('dashboard.admin.totalUsers')}
              value={stats.totalUsers}
              subtitle={t('dashboard.admin.activeUsers')}
              icon={<PeopleIcon />}
              color="#1976d2"
              trend={5.2}
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatCard 
              label={t('dashboard.admin.activeCalls')}
              value={stats.activeTenders}
              subtitle={t('dashboard.admin.inProgress')}
              icon={<ArticleIcon />}
              color="#388e3c"
              trend={3.1}
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatCard 
              label={t('dashboard.admin.systemHealth')}
              value={`${stats.systemHealth}%`}
              subtitle={t('dashboard.admin.generalState')}
              icon={<TrendingUpIcon />}
              color={stats.systemHealth > 90 ? '#388e3c' : stats.systemHealth > 70 ? '#f57c00' : '#d32f2f'}
              trend={-0.8}
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatCard 
              label={t('dashboard.admin.errorRate')}
              value={`${stats.errorRate}%`}
              subtitle={t('dashboard.admin.lastHour')}
              icon={<ErrorIcon />}
              color={stats.errorRate < 1 ? '#388e3c' : stats.errorRate < 5 ? '#f57c00' : '#d32f2f'}
              trend={-0.3}
            />
          </Grid>
          <Grid xs={12} sm={6} md={2.4}>
            <StatCard 
              label={t('dashboard.admin.responseTime')}
              value={`${stats.responseTime}ms`}
              subtitle={t('dashboard.admin.average')}
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
              {t('dashboard.admin.quickLinks')}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.admin.userManagement')}
                  secondary={t('dashboard.admin.manageAllUsers')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.admin.securityLogs')}
                  secondary={t('dashboard.admin.viewAuditLogs')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.admin.analyticsReports')}
                  secondary={t('dashboard.admin.analyzePerformance')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.admin.systemSettings')}
                  secondary={t('dashboard.admin.advancedMaintenance')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* System Health Details */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                  {t('dashboard.admin.systemResources')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={t('dashboard.admin.cpuUsage')}
                      secondary="45.2%"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('dashboard.admin.memory')}
                      secondary="62.8% (5.2GB / 8GB)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('dashboard.admin.storage')}
                      secondary="78.4% {t('dashboard.admin.used')}"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('dashboard.admin.dbConnections')}
                      secondary="8/20 actives"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                  {t('dashboard.admin.servicesStatus')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.admin.apiServer')}
                      secondary={t('dashboard.admin.operational')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.admin.database')}
                      secondary={t('dashboard.admin.operational')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.admin.cacheRedis')}
                      secondary={t('dashboard.admin.operational')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4caf50' }} /></ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.admin.emailService')}
                      secondary={t('dashboard.admin.operational')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <SnackbarComponent
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      </Container>
    </Box>
  );
}

// Wrap with Error Boundary
export default function SuperAdminDashboard() {
  return (
    <EnhancedErrorBoundary>
      <SuperAdminDashboardContent />
    </EnhancedErrorBoundary>
  );
}
