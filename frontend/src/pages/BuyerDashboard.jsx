import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react'; // Import React for useMemo
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Description,
  TrendingUp,
  CheckCircle,
  Schedule,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Gavel as GavelIcon,
  LocalOffer as LocalOfferIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import institutionalTheme from '../theme/theme';
import { setPageTitle } from '../utils/pageTitle';
import { procurementAPI } from '../api/procurementApi';
import { useAuth } from '../contexts/AppContext';


const DRAWER_WIDTH = 240;

/**
 * 🎯 Buyer Dashboard - Enhanced with Security & Analytics
 * 
 * @component BuyerDashboard
 * @description Main dashboard for buyer users displaying tender statistics,
 * analytics, and quick actions. Includes error handling with retry logic
 * and comprehensive loading states.
 * 
 * @requires TokenManager - For user authentication data
 * @requires procurementApi - For fetching dashboard statistics
 * 
 * @returns {JSX.Element} Rendered buyer dashboard with stats and analytics
 * 
 * @example
 * // Route configuration
 * <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
 */
export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTenders: 0,
    totalOffers: 0,
    completedTenders: 0,
    pendingEvaluations: 0,
  });
  const [analytics, setAnalytics] = useState({}); // Added state for analytics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Safely extract user ID with fallback
  const { user } = useAuth();
  const userId = React.useMemo(() => {
    if (!user) return null;
    return user.userId || user.id || user.user_id;
  }, [user]);


  useEffect(() => {
    setPageTitle('Tableau de Bord Acheteur');
    
    // Only fetch if user is authenticated and has an ID
    if (!user) {
      setLoading(false);
      return;
    }
    
    const id = user.id || user.userId;
    if (!id) {
      console.warn('⚠️ User object exists but no ID found');
      setLoading(false);
      setError('Identifiant utilisateur manquant. Veuillez vous reconnecter.');
      return;
    }
    
    console.log('📊 Fetching dashboard data for user:', id);
    fetchDashboardData();
  }, [user?.id, user?.userId]); // Watch both ID fields

  const fetchDashboardData = async (retryCount = 0) => {
    if (!userId) {
      console.warn('⚠️ No userId available, skipping dashboard fetch');
      setLoading(false);
      setError('معرف المستخدم غير متوفر. الرجاء تسجيل الدخول مرة أخرى.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching dashboard data for user:', userId);

      const [statsRes, analyticsRes] = await Promise.allSettled([
        procurementAPI.buyer.getDashboardStats(),
        procurementAPI.buyer.getAnalytics()
      ]);

      // Handle stats response
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats({
          activeTenders: parseInt(statsRes.value.data.activeTenders) || 0,
          totalOffers: parseInt(statsRes.value.data.totalOffers) || 0,
          completedTenders: parseInt(statsRes.value.data.completedTenders) || 0,
          pendingEvaluations: parseInt(statsRes.value.data.pendingEvaluations) || 0,
        });
      } else if (statsRes.status === 'rejected') {
        console.warn('فشل تحميل الإحصائيات:', statsRes.reason);
        // تعيين قيم افتراضية في حالة الفشل
        setStats({
          activeTenders: 0,
          totalOffers: 0,
          completedTenders: 0,
          pendingEvaluations: 0,
        });
      }

      // Handle analytics response
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.analytics) {
        console.log('Analytics loaded successfully:', analyticsRes.value.data.analytics);
        setAnalytics(analyticsRes.value.data.analytics); // Set analytics state
      } else if (analyticsRes.status === 'rejected') {
        console.warn('فشل تحميل التحليلات:', analyticsRes.reason);
        setAnalytics({}); // Clear analytics on failure
      }

      // Only show error if BOTH requests failed
      if (statsRes.status === 'rejected' && analyticsRes.status === 'rejected') {
        const errorMsg = statsRes.reason?.response?.data?.error ||
                        statsRes.reason?.message ||
                        analyticsRes.reason?.response?.data?.error ||
                        analyticsRes.reason?.message ||
                        'Impossible de charger les données du tableau de bord';
        setError(errorMsg);
      }

    } catch (err) {
      console.error('❌ Dashboard data fetch error:', err);

      // Retry logic for network errors
      if (retryCount < 2 && (err.code === 'ECONNABORTED' || err.message.includes('Network Error'))) {
        console.log(`⚠️ Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => fetchDashboardData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      // Set user-friendly error messages
      let errorMsg = 'خطأ في تحميل البيانات';
      if (err.response?.status === 401) {
        errorMsg = 'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.';
      } else if (err.response?.status === 503) {
        errorMsg = 'الخدمة غير متاحة حالياً. الرجاء المحاولة لاحقاً.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'انتهت مهلة الطلب. تحقق من اتصال الإنترنت.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }

      setError(errorMsg);

      // Set default values to prevent blank page
      setStats({
        activeTenders: 0,
        totalOffers: 0,
        completedTenders: 0,
        pendingEvaluations: 0,
      });
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/buyer-dashboard' },
    { text: 'Appels d\'Offres', icon: <GavelIcon />, path: '/tenders' },
    { text: 'Créer un Appel', icon: <AddIcon />, path: '/create-tender' },
    { text: 'Offres Reçues', icon: <LocalOfferIcon />, path: '/buyer-active-tenders' },
    { text: 'Rapports Financiers', icon: <AssessmentIcon />, path: '/financial-reports' },
    { text: 'Budgets', icon: <AccountBalanceIcon />, path: '/budgets' },
    { text: 'Gestion d\'Équipe', icon: <PeopleIcon />, path: '/team-management' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
  ];

  const dashboardCards = [
    {
      title: 'Appels d\'Offres Actifs',
      value: stats.activeTenders,
      icon: Description,
      color: institutionalTheme.palette.primary.main,
      subtitle: 'En cours',
      action: () => navigate('/buyer-active-tenders'),
    },
    {
      title: 'Total des Offres',
      value: stats.totalOffers,
      icon: TrendingUp,
      color: institutionalTheme.palette.info.main,
      subtitle: 'Offres reçues',
      action: () => navigate('/buyer/offers'),
    },
    {
      title: 'Appels Complétés',
      value: stats.completedTenders,
      icon: CheckCircle,
      color: institutionalTheme.palette.success.main,
      subtitle: 'Terminés',
      action: () => navigate('/buyer/completed-tenders'),
    },
    {
      title: 'Évaluations en Attente',
      value: stats.pendingEvaluations,
      icon: Schedule,
      color: institutionalTheme.palette.warning.main,
      subtitle: 'À traiter',
      action: () => navigate('/buyer/evaluations'),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Menu Button */}
      <IconButton
        onClick={() => setMenuOpen(!menuOpen)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: 16,
          top: 80,
          zIndex: 1200,
          backgroundColor: institutionalTheme.palette.primary.main,
          color: 'white',
          '&:hover': { backgroundColor: institutionalTheme.palette.primary.dark },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Navigation Menu */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <ListItemIcon sx={{ color: institutionalTheme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, top: 64 },
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ color: institutionalTheme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Container maxWidth="lg">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: institutionalTheme.palette.primary.main,
              }}
            >
              Tableau de Bord Acheteur
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-tender')}
              sx={{
                backgroundColor: institutionalTheme.palette.primary.main,
                '&:hover': {
                  backgroundColor: institutionalTheme.palette.primary.dark,
                },
              }}
            >
              Créer un Nouvel Appel d'Offre
            </Button>
          </Box>

          <Grid container spacing={3}>
            {dashboardCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: institutionalTheme.palette.divider,
                    boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={card.action}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: card.color, mb: 0.5 }}>
                          {card.value}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {card.subtitle}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: `${card.color}15`,
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <card.icon sx={{ fontSize: 28, color: card.color }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mt: 4, border: '1px solid', borderColor: institutionalTheme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Actions Rapides
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: institutionalTheme.palette.divider,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: institutionalTheme.palette.primary.main,
                        backgroundColor: `${institutionalTheme.palette.primary.main}08`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate('/create-tender')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.primary.main}15` }}>
                        <AddIcon sx={{ color: institutionalTheme.palette.primary.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Créer un Nouvel Appel d'Offre
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Lancer une nouvelle procédure
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: institutionalTheme.palette.divider,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: institutionalTheme.palette.info.main,
                        backgroundColor: `${institutionalTheme.palette.info.main}08`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate('/buyer-active-tenders')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.info.main}15` }}>
                        <GavelIcon sx={{ color: institutionalTheme.palette.info.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Appels d'Offres Actifs
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Voir et gérer les appels
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: institutionalTheme.palette.divider,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: institutionalTheme.palette.success.main,
                        backgroundColor: `${institutionalTheme.palette.success.main}08`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate('/buyer-analytics')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.success.main}15` }}>
                        <AssessmentIcon sx={{ color: institutionalTheme.palette.success.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Rapports et Analyses
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Analyses détaillées
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}