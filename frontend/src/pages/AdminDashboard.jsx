
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  People as UsersIcon,
  Gavel as TendersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Schedule,
  BarChart,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import institutionalTheme from '../theme/theme';
import { setPageTitle } from '../utils/pageTitle';
import TokenManager from '../services/tokenManager';
import EnhancedTable from '../components/EnhancedTable';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const theme = institutionalTheme;
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    setPageTitle('Tableau de Bord Assistant Administrateur - MyNet.tn');
    const userData = TokenManager.getUser();
    setUser(userData);
    setPermissions(userData?.permissions || ['view_users', 'view_reports']);
  }, []);

  const stats = [
    { 
      label: 'Total Utilisateurs', 
      value: 342, 
      change: 8.2,
      icon: UsersIcon, 
      color: theme.palette.primary.main,
      subtitle: '+28 ce mois'
    },
    { 
      label: 'Appels d\'Offres Actifs', 
      value: 67, 
      change: 12.5,
      icon: TendersIcon, 
      color: theme.palette.success.main,
      subtitle: '45 en évaluation'
    },
    { 
      label: 'Rapports Aujourd\'hui', 
      value: 12, 
      change: -3.1,
      icon: ReportsIcon, 
      color: theme.palette.warning.main,
      subtitle: '8 complétés'
    },
    { 
      label: 'Taux d\'Activité', 
      value: '87%', 
      change: 5.3,
      icon: TrendingUp, 
      color: theme.palette.info.main,
      subtitle: 'Performance excellente'
    },
  ];

  const activityData = [
    { day: 'Lundi', users: 290, tenders: 48 },
    { day: 'Mardi', users: 320, tenders: 55 },
    { day: 'Mercredi', users: 305, tenders: 51 },
    { day: 'Jeudi', users: 330, tenders: 58 },
    { day: 'Vendredi', users: 270, tenders: 42 },
    { day: 'Samedi', users: 280, tenders: 45 },
    { day: 'Dimanche', users: 310, tenders: 52 },
  ];

  const recentActivities = [
    { 
      id: 1, 
      type: 'user', 
      message: 'Nouvel utilisateur enregistré', 
      user: 'Ahmed Mohamed',
      time: 'Il y a 5 minutes',
      status: 'success'
    },
    { 
      id: 2, 
      type: 'tender', 
      message: 'Nouvel appel d\'offre créé', 
      user: 'Société Succès',
      time: 'Il y a 15 minutes',
      status: 'info'
    },
    { 
      id: 3, 
      type: 'report', 
      message: 'Rapport mensuel prêt', 
      user: 'Système',
      time: 'Il y a 1 heure',
      status: 'warning'
    },
    { 
      id: 4, 
      type: 'security', 
      message: 'Tentative de connexion suspecte', 
      user: 'Système de sécurité',
      time: 'Il y a 2 heures',
      status: 'error'
    },
  ];

  const systemHealth = [
    { name: 'Base de Données', status: 'healthy', value: 98 },
    { name: 'Serveur', status: 'healthy', value: 95 },
    { name: 'API', status: 'healthy', value: 99 },
    { name: 'Stockage', status: 'warning', value: 75 },
  ];

  const quickActions = [
    { 
      label: 'Gestion des Utilisateurs', 
      path: '/super-admin/users', 
      color: 'primary',
      icon: UsersIcon,
      permission: 'manage_users',
      description: 'Voir et gérer les utilisateurs'
    },
    { 
      label: 'Voir les Rapports', 
      path: '/financial-reports', 
      color: 'secondary',
      icon: ReportsIcon,
      permission: 'view_reports',
      description: 'Rapports détaillés'
    },
    { 
      label: 'Gestion des Appels', 
      path: '/tenders', 
      color: 'info',
      icon: TendersIcon,
      permission: 'manage_tenders',
      description: 'Surveillance des appels'
    },
    { 
      label: 'Paramètres', 
      path: '/dynamic-config', 
      color: 'success',
      icon: SettingsIcon,
      permission: 'manage_settings',
      description: 'Configuration système'
    },
    { 
      label: 'Notifications', 
      path: '/email-notifications', 
      color: 'warning',
      icon: NotificationsIcon,
      permission: 'send_notifications',
      description: 'Envoyer des notifications'
    },
    { 
      label: 'Sécurité', 
      path: '/super-admin/audit-logs', 
      color: 'error',
      icon: SecurityIcon,
      permission: 'view_audit_logs',
      description: 'Journaux d\'audit'
    },
  ];

  const hasPermission = (permission) => {
    return permissions.includes(permission) || permissions.includes('all');
  };

  const availableActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'warning': return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'error': return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default: return <Schedule sx={{ color: theme.palette.info.main }} />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Vous n'avez pas la permission d'accéder à cette page</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main, 
            mb: 1 
          }}
        >
          Tableau de Bord Assistant Administrateur
        </Typography>
<Typography variant="body2" color="textSecondary">
          Bienvenue {user.username || user.email} - Gestion complète du système
        </Typography>
      </Box>

      {/* Permissions Notice */}
      {permissions.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Permissions disponibles:</strong> {permissions.join(', ')}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}15`,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon sx={{ fontSize: 28, color: stat.color }} />
                  </Box>
                </Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  <Typography 
                    variant="body2" 
                    sx={{ color: theme.palette.success.main, fontWeight: 600 }}
                  >
                    {Math.abs(stat.change)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    vs semaine dernière
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activity Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activité Utilisateurs et Appels d'Offres (7 derniers jours)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <ChartTooltip />
                  <Bar dataKey="users" fill={theme.palette.primary.main} name="Utilisateurs" />
                  <Bar dataKey="tenders" fill={theme.palette.success.main} name="Appels d'Offres" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Santé du Système
              </Typography>
              <Stack spacing={2}>
                {systemHealth.map((item, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Chip 
                        label={item.status === 'healthy' ? 'Sain' : 'Avertissement'}
                        size="small"
                        color={item.status === 'healthy' ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ flex: 1, height: 8, backgroundColor: theme.palette.grey[200], borderRadius: 1, overflow: 'hidden' }}>
                        <Box 
                          sx={{ 
                            width: `${item.value}%`, 
                            height: '100%', 
                            backgroundColor: item.status === 'healthy' ? theme.palette.success.main : theme.palette.warning.main
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ minWidth: 40 }}>{item.value}%</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Actions Rapides
          </Typography>
          {availableActions.length > 0 ? (
            <Grid container spacing={2}>
              {availableActions.map((action, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: `${theme.palette.primary.main}08`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${theme.palette[action.color].main}15` }}>
                        <action.icon sx={{ color: theme.palette[action.color].main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {action.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {action.description}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="warning">
              Aucune permission disponible. Veuillez contacter le Super Administrateur.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Activité Récente
          </Typography>
          <List>
            {recentActivities.map((activity, idx) => (
              <Box key={activity.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getStatusIcon(activity.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.time}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                {idx < recentActivities.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
