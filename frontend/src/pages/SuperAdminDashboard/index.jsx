/**
 * Super Admin Dashboard - مركز التحكم المركزي
 * واجهة إدارة احترافية عالمية شاملة
 * @component
 * @returns {JSX.Element} لوحة تحكم سوبر أدمين
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import institutionalTheme from '../../theme/theme';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  Divider,
  LinearProgress,
  CircularProgress,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Dashboard,
  Settings,
  People,
  BarChart,
  Security,
  Assessment,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Search,
  MoreVert,
  Edit,
  Delete,
  Lock,
  Visibility,
  Menu,
  Close,
  TrendingUp,
  AlertCircle,
  Database,
  Globe,
  Clock,
} from '@mui/icons-material';
import { adminAPI } from '../../api';
import { logger } from '../../utils/logger';
import EnhancedErrorBoundary from '../../components/EnhancedErrorBoundary';

const THEME_COLORS = institutionalTheme.palette;

/**
 * Stat Card Component
 */
function StatCard({ title, value, change, icon: Icon, color, loading }) {
  return (
    <Card sx={{ 
      height: '100%',
      backgroundColor: '#FFFFFF',
      border: `1px solid ${THEME_COLORS.divider}`,
      borderRadius: '8px',
      boxShadow: 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: THEME_COLORS.primary.main,
      }
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 600, mt: 1, color: THEME_COLORS.primary.main }}>
                {value}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: `${color}20`, width: 40, height: 40 }}>
            <Icon sx={{ color, fontSize: 24 }} />
          </Avatar>
        </Stack>
        {change && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <TrendingUp sx={{ fontSize: 16, color: change > 0 ? THEME_COLORS.success.main : THEME_COLORS.error.main }} />
            <Typography variant="body2" sx={{ color: change > 0 ? THEME_COLORS.success.main : THEME_COLORS.error.main }}>
              {Math.abs(change)}% {change > 0 ? 'augmentation' : 'diminution'}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * System Health Component
 */
function SystemHealth({ status, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return THEME_COLORS.success.main;
      case 'degraded': return THEME_COLORS.warning.main;
      case 'critical': return THEME_COLORS.error.main;
      default: return THEME_COLORS.secondary.main;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      operational: 'Opérationnel',
      degraded: 'Dégradé',
      critical: 'Critique',
    };
    return statusMap[status] || status;
  };

  return (
    <Card sx={{ 
      backgroundColor: '#FFFFFF',
      border: `1px solid ${THEME_COLORS.divider}`,
      borderRadius: '8px',
      boxShadow: 'none',
    }}>
      <CardHeader 
        title="Santé du Système" 
        avatar={<Activity sx={{ color: getStatusColor(status) }} />}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">État Global</Typography>
            <Chip 
              label={getStatusText(status)}
              color={status === 'operational' ? 'success' : status === 'degraded' ? 'warning' : 'error'}
              variant="filled"
              size="small"
            />
          </Stack>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Performance</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>95%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: '4px' }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Disponibilité API</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>99.9%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={99.9} sx={{ height: 8, borderRadius: '4px' }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Base de Données</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>98%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={98} sx={{ height: 8, borderRadius: '4px' }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Actions Component
 */
function QuickActions({ navigate }) {
  const actions = [
    { label: 'Utilisateurs', icon: People, path: '/super-admin/users' },
    { label: 'Audit', icon: Assessment, path: '/super-admin/audit-logs' },
    { label: 'Paramètres', icon: Settings, path: '/super-admin/features' },
    { label: 'Sécurité', icon: Security, path: '/super-admin/health' },
  ];

  return (
    <Card sx={{ 
      backgroundColor: '#FFFFFF',
      border: `1px solid ${THEME_COLORS.divider}`,
      borderRadius: '8px',
      boxShadow: 'none',
    }}>
      <CardHeader title="Actions Rapides" />
      <CardContent>
        <Stack spacing={1}>
          {actions.map((action) => (
            <Button
              key={action.path}
              fullWidth
              variant="outlined"
              startIcon={<action.icon />}
              onClick={() => navigate(action.path)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: THEME_COLORS.text.primary,
                borderColor: THEME_COLORS.divider,
                '&:hover': {
                  borderColor: THEME_COLORS.primary.main,
                  backgroundColor: `${THEME_COLORS.primary.main}08`,
                }
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Recent Activity Component
 */
function RecentActivity() {
  const activities = [
    { id: 1, action: 'Nouvel utilisateur enregistré', time: 'Il y a 2 min', user: 'Système' },
    { id: 2, action: 'Appel API important exécuté', time: 'Il y a 15 min', user: 'API' },
    { id: 3, action: 'Sauvegarde base de données', time: 'Il y a 1 h', user: 'Système' },
    { id: 4, action: 'Erreur 500 détectée et résolue', time: 'Il y a 2 h', user: 'Monitoring' },
  ];

  return (
    <Card sx={{ 
      backgroundColor: '#FFFFFF',
      border: `1px solid ${THEME_COLORS.divider}`,
      borderRadius: '8px',
      boxShadow: 'none',
    }}>
      <CardHeader title="Activité Récente" />
      <CardContent>
        <Stack spacing={2}>
          {activities.map((activity) => (
            <Stack key={activity.id} direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: THEME_COLORS.primary.main }} />
              <Stack flex={1} spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {activity.action}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {activity.time}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Main Super Admin Dashboard Component
 */
function SuperAdminDashboardContent() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTenders: 0,
    completedOffers: 0,
    systemHealth: 95,
  });
  const [systemStatus, setSystemStatus] = useState('operational');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await adminAPI.getStatistics();
      const data = statsRes.data?.data || {};

      setStats({
        totalUsers: data.total_users || 0,
        activeTenders: data.active_tenders || 0,
        completedOffers: data.completed_offers || 0,
        systemHealth: data.system_health || 95,
      });

      setSystemStatus(data.system_health > 90 ? 'operational' : data.system_health > 70 ? 'degraded' : 'critical');
      logger.info('Statistiques super admin chargées');
    } catch (error) {
      logger.error('Erreur chargement stats super admin', error);
      setSystemStatus('degraded');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchSystemStats();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9F9F9' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${THEME_COLORS.divider}`,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Dashboard sx={{ color: THEME_COLORS.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: THEME_COLORS.primary.main }}>
            Centre de Contrôle Super Admin
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualiser">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ textTransform: 'none' }}
            >
              Actualiser
            </Button>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Alert Section */}
        {systemStatus !== 'operational' && (
          <Alert 
            severity={systemStatus === 'degraded' ? 'warning' : 'error'}
            icon={systemStatus === 'degraded' ? <AlertCircle /> : <Warning />}
            sx={{ mb: 3, borderRadius: '8px' }}
          >
            {systemStatus === 'degraded' 
              ? 'Système en performance dégradée - Veuillez vérifier les logs'
              : 'État critique du système - Action immédiate requise'}
          </Alert>
        )}

        {/* Statistics Section */}
        <Grid xs={12} sm={6} md={3} spacing={3} sx={{ mb: 4 }} container>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Utilisateurs Totaux"
              value={stats.totalUsers}
              change={2.5}
              icon={People}
              color={THEME_COLORS.primary.main}
              loading={loading}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Appels d'Offres Actifs"
              value={stats.activeTenders}
              change={5.2}
              icon={Assessment}
              color={THEME_COLORS.success.main}
              loading={loading}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Offres Complétées"
              value={stats.completedOffers}
              change={3.1}
              icon={CheckCircle}
              color={THEME_COLORS.info.main}
              loading={loading}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Santé Système"
              value={`${stats.systemHealth}%`}
              icon={Activity}
              color={THEME_COLORS.warning.main}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* System Health and Quick Actions */}
        <Grid xs={12} md={8} spacing={3} sx={{ mb: 4 }} container>
          <Grid xs={12}>
            <SystemHealth status={systemStatus} loading={loading} />
          </Grid>
        </Grid>

        {/* Quick Actions and Recent Activity */}
        <Grid xs={12} md={6} spacing={3} container>
          <Grid xs={12} md={6}>
            <QuickActions navigate={navigate} />
          </Grid>
          <Grid xs={12} md={6}>
            <RecentActivity key={refreshKey} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function SuperAdminDashboard() {
  return (
    <EnhancedErrorBoundary>
      <SuperAdminDashboardContent />
    </EnhancedErrorBoundary>
  );
}
