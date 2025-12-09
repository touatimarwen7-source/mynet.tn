
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
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
  Avatar,
  Stack,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalOffer as LocalOfferIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { procurementAPI } from '../api/procurementApi';
import { useAuth } from '../contexts/AppContext';
import institutionalTheme from '../theme/theme';
import { setPageTitle } from '../utils/pageTitle';

const DRAWER_WIDTH = 240;

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalOffers: 0,
    acceptedOffers: 0,
    avgOfferValue: 0,
    activeOrders: 0,
  });

  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    avgRating: '0.0',
    recentOrders: [],
  });

  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Extract user ID safely
  const userId = React.useMemo(() => {
    if (!user) return null;
    return user.userId || user.id || user.user_id;
  }, [user]);

  useEffect(() => {
    setPageTitle('Tableau de Bord Fournisseur');
    
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
    
    if (import.meta.env.DEV) {
      console.log('📊 Fetching dashboard data for supplier:', id);
    }
    fetchDashboardData();
  }, [user?.id, user?.userId, fetchDashboardData]);

  const fetchDashboardData = useCallback(async (retryCount = 0) => {
    if (!userId) {
      console.warn('⚠️ No userId available, skipping dashboard fetch');
      setLoading(false);
      setError('معرف المستخدم غير متوفر. الرجاء تسجيل الدخول مرة أخرى.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching dashboard data for supplier:', userId);

      const [statsRes, analyticsRes, tendersRes] = await Promise.allSettled([
        procurementAPI.supplier.getDashboardStats(),
        procurementAPI.supplier.getAnalytics(),
        procurementAPI.getTenders({
          page: 1,
          limit: 5,
          is_public: true
        })
      ]);

      // Handle stats response
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats({
          totalOffers: parseInt(statsRes.value.data.totalOffers) || 0,
          acceptedOffers: parseInt(statsRes.value.data.acceptedOffers) || 0,
          avgOfferValue: parseInt(statsRes.value.data.avgOfferValue) || 0,
          activeOrders: parseInt(statsRes.value.data.activeOrders) || 0,
        });
      } else if (statsRes.status === 'rejected') {
        console.warn('فشل تحميل الإحصائيات:', statsRes.reason);
        setStats({
          totalOffers: 0,
          acceptedOffers: 0,
          avgOfferValue: 0,
          activeOrders: 0,
        });
      }

      // Handle analytics response
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.analytics) {
        console.log('Analytics loaded successfully:', analyticsRes.value.data.analytics);
        setAnalytics({
          totalReviews: analyticsRes.value.data.analytics.totalReviews || 0,
          avgRating: String(analyticsRes.value.data.analytics.avgRating || '0.0'),
          recentOrders: analyticsRes.value.data.analytics.recentOrders || [],
        });
      } else if (analyticsRes.status === 'rejected') {
        console.warn('فشل تحميل التحليلات:', analyticsRes.reason);
        setAnalytics({
          totalReviews: 0,
          avgRating: '0.0',
          recentOrders: [],
        });
      }

      // Handle tenders response
      if (tendersRes.status === 'fulfilled' && tendersRes.value?.data?.tenders) {
        setRecentTenders(tendersRes.value.data.tenders);
      } else if (tendersRes.status === 'rejected') {
        console.warn('فشل تحميل المناقصات:', tendersRes.reason);
        setRecentTenders([]);
      }

      // Only show error if ALL requests failed
      if (statsRes.status === 'rejected' && analyticsRes.status === 'rejected' && tendersRes.status === 'rejected') {
        const errorMsg = statsRes.reason?.response?.data?.error ||
                        statsRes.reason?.message ||
                        'Impossible de charger les données du tableau de bord';
        setError(errorMsg);
      }

    } catch (err) {
      console.error('❌ Dashboard data fetch error:', err);

      // Retry logic for network errors - improved
      const isRetryable = err.code === 'ECONNABORTED' || 
                          err.code === 'ERR_NETWORK' ||
                          err.message.includes('Network Error') ||
                          !err.response;
                          
      if (retryCount < 2 && isRetryable) {
        console.log(`⚠️ Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => fetchDashboardData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      // Set user-friendly error messages
      let errorMsg = 'Erreur de chargement des données';
      if (err.response?.status === 401) {
        errorMsg = 'Session expirée. Veuillez vous reconnecter.';
        // Optionally redirect to login
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        errorMsg = 'Accès refusé. Permissions insuffisantes.';
      } else if (err.response?.status === 503) {
        errorMsg = 'Service temporairement indisponible.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Erreur réseau. Vérifiez votre connexion internet.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }

      setError(errorMsg);

      // Set default values
      setStats({
        totalOffers: 0,
        acceptedOffers: 0,
        avgOfferValue: 0,
        activeOrders: 0,
      });
      setAnalytics({
        totalReviews: 0,
        avgRating: '0.0',
        recentOrders: [],
      });
      setRecentTenders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/supplier-dashboard' },
    { text: 'Appels d\'Offres', icon: <GavelIcon />, path: '/tenders' },
    { text: 'Mes Offres', icon: <LocalOfferIcon />, path: '/my-offers' },
    { text: 'Mes Produits', icon: <InventoryIcon />, path: '/supplier-products' },
    { text: 'Analyses', icon: <AssessmentIcon />, path: '/supplier-analytics' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
  ];

  const dashboardCards = [
    {
      title: 'Offres Totales',
      value: stats.totalOffers,
      icon: AssignmentIcon,
      color: institutionalTheme.palette.primary.main,
      subtitle: 'Soumises',
      action: () => navigate('/my-offers'),
    },
    {
      title: 'Offres Acceptées',
      value: stats.acceptedOffers,
      icon: TrendingUpIcon,
      color: institutionalTheme.palette.success.main,
      subtitle: 'Gagnées',
      action: () => navigate('/my-offers'),
    },
    {
      title: 'Commandes Actives',
      value: stats.activeOrders,
      icon: LocalShippingIcon,
      color: institutionalTheme.palette.info.main,
      subtitle: 'En cours',
      action: () => navigate('/supplier-invoices'),
    },
    {
      title: 'Note Moyenne',
      value: typeof analytics.avgRating === 'string' ? analytics.avgRating : (analytics.avgRating || 0).toFixed(1),
      icon: StarIcon,
      color: institutionalTheme.palette.warning.main,
      subtitle: `sur ${analytics.totalReviews || 0} avis`,
      action: () => navigate('/reviews'),
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
              Tableau de Bord Fournisseur
            </Typography>
            <Button
              variant="contained"
              startIcon={<GavelIcon />}
              onClick={() => navigate('/tenders')}
              sx={{
                backgroundColor: institutionalTheme.palette.primary.main,
                '&:hover': {
                  backgroundColor: institutionalTheme.palette.primary.dark,
                },
              }}
            >
              Voir les Appels d'Offres
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
                    onClick={() => navigate('/tenders')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.primary.main}15` }}>
                        <GavelIcon sx={{ color: institutionalTheme.palette.primary.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Parcourir les Appels d'Offres
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Voir les opportunités disponibles
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
                    onClick={() => navigate('/my-offers')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.info.main}15` }}>
                        <LocalOfferIcon sx={{ color: institutionalTheme.palette.info.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Mes Offres
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Gérer mes soumissions
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
                    onClick={() => navigate('/supplier-analytics')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.success.main}15` }}>
                        <AssessmentIcon sx={{ color: institutionalTheme.palette.success.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Analyses et Rapports
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Voir mes performances
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
