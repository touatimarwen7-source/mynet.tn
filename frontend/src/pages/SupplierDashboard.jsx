
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Drawer,
  Divider,
  ListItemButton,
  ListItemIcon,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  LocalOffer as LocalOfferIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Gavel as GavelIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import axiosInstance from '../services/axiosConfig';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import institutionalTheme from '../theme/theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DRAWER_WIDTH = 240;

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [stats, setStats] = useState({
    totalOffers: 0,
    acceptedOffers: 0,
    rejectedOffers: 0,
    availableTenders: 0,
    pendingOffers: 0,
    totalRevenue: 0,
    avgOfferValue: 0,
    activeOrders: 0,
  });
  
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    avgRating: 0,
    winRate: 0,
    totalOrders: 0,
  });

  const [trends, setTrends] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching supplier dashboard data...');

      const [statsRes, analyticsRes, trendsRes, ordersRes, tendersRes] = await Promise.allSettled([
        axiosInstance.get('/api/procurement/supplier/dashboard-stats'),
        axiosInstance.get('/api/procurement/supplier/analytics'),
        axiosInstance.get('/api/procurement/supplier/trends'),
        axiosInstance.get('/api/procurement/supplier/recent-orders'),
        axiosInstance.get('/api/procurement/tenders', { params: { limit: 5, status: 'open' } }),
      ]);

      // Stats with safe fallbacks
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const statsData = statsRes.value.data;
        setStats({
          totalOffers: statsData.totalOffers || 0,
          acceptedOffers: statsData.acceptedOffers || 0,
          rejectedOffers: statsData.rejectedOffers || 0,
          availableTenders: statsData.availableTenders || 0,
          pendingOffers: statsData.pendingOffers || 0,
          totalRevenue: statsData.totalRevenue || 0,
          avgOfferValue: statsData.avgOfferValue || 0,
          activeOrders: statsData.activeOrders || 0,
          offersChange: statsData.offersChange || 0,
          winRateChange: statsData.winRateChange || 0,
          revenueChange: statsData.revenueChange || 0,
          tendersChange: statsData.tendersChange || 0,
        });
        console.log('✅ Stats loaded:', statsData);
      } else {
        console.warn('⚠️ Stats failed:', statsRes.reason?.message);
      }

      // Analytics with safe fallbacks
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.analytics) {
        const analyticsData = analyticsRes.value.data.analytics;
        setAnalytics({
          totalReviews: analyticsData.totalReviews || 0,
          avgRating: analyticsData.avgRating || 0,
          winRate: analyticsData.winRate || 0,
          totalOrders: analyticsData.totalOrders || 0,
        });
        console.log('✅ Analytics loaded:', analyticsData);
      } else {
        console.warn('⚠️ Analytics failed:', analyticsRes.reason?.message);
        setAnalytics({ totalReviews: 0, avgRating: 0, winRate: 0, totalOrders: 0 });
      }

      // Trends with safe fallbacks
      if (trendsRes.status === 'fulfilled' && trendsRes.value?.data?.trends) {
        setTrends(trendsRes.value.data.trends);
        console.log('✅ Trends loaded');
      } else {
        console.warn('⚠️ Trends failed:', trendsRes.reason?.message);
        setTrends([]);
      }

      // Orders with safe fallbacks
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data?.orders) {
        setRecentOrders(ordersRes.value.data.orders);
        console.log('✅ Orders loaded');
      } else {
        console.warn('⚠️ Orders failed:', ordersRes.reason?.message);
        setRecentOrders([]);
      }

      // Tenders with safe fallbacks
      if (tendersRes.status === 'fulfilled' && tendersRes.value?.data?.tenders) {
        setRecentTenders(tendersRes.value.data.tenders);
        console.log('✅ Tenders loaded');
      } else {
        console.warn('⚠️ Tenders failed:', tendersRes.reason?.message);
        setRecentTenders([]);
      }

      console.log('✅ Dashboard data fetch completed');

    } catch (err) {
      console.error('❌ Dashboard Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Échec du chargement des données du tableau de bord';
      setError(errorMessage);
      
      // Set safe defaults on error
      setStats({
        totalOffers: 0,
        acceptedOffers: 0,
        rejectedOffers: 0,
        availableTenders: 0,
        pendingOffers: 0,
        totalRevenue: 0,
        avgOfferValue: 0,
        activeOrders: 0,
      });
      setAnalytics({ totalReviews: 0, avgRating: 0, winRate: 0, totalOrders: 0 });
      setTrends([]);
      setRecentOrders([]);
      setRecentTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/supplier-dashboard' },
    { text: 'Appels d\'Offres Disponibles', icon: <GavelIcon />, path: '/tenders' },
    { text: 'Mes Offres', icon: <LocalOfferIcon />, path: '/my-offers' },
    { text: 'Commandes Actives', icon: <ShoppingCartIcon />, path: '/supplier-orders' },
    { text: 'Factures', icon: <DescriptionIcon />, path: '/supplier-invoices' },
    { text: 'Produits et Services', icon: <InventoryIcon />, path: '/supplier-products' },
    { text: 'Analyses', icon: <AssessmentIcon />, path: '/supplier-analytics' },
    { text: 'Gestion d\'Équipe', icon: <PeopleIcon />, path: '/supplier-team-management' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
  ];

  const dashboardCards = [
    {
      title: 'Total des Offres',
      value: stats.totalOffers || 0,
      icon: AssignmentIcon,
      color: institutionalTheme.palette.primary.main,
      subtitle: 'Offres soumises',
      change: stats.offersChange,
      action: () => navigate('/my-offers'),
    },
    {
      title: 'Offres Acceptées',
      value: stats.acceptedOffers || 0,
      icon: CheckCircleIcon,
      color: institutionalTheme.palette.success.main,
      subtitle: 'Offres gagnées',
      change: stats.winRateChange,
      action: () => navigate('/my-offers?status=accepted'),
    },
    {
      title: 'Revenus Totaux',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 0,
      }).format(stats.totalRevenue || 0),
      icon: AttachMoneyIcon,
      color: institutionalTheme.palette.info.main,
      subtitle: 'Revenus cumulés',
      change: stats.revenueChange,
      action: () => navigate('/supplier-analytics'),
    },
    {
      title: 'Appels d\'Offres Disponibles',
      value: stats.availableTenders || 0,
      icon: LocalOfferIcon,
      color: institutionalTheme.palette.warning.main,
      subtitle: 'Nouvelles opportunités',
      change: stats.tendersChange,
      action: () => navigate('/tenders'),
    },
  ];

  const revenueChartData = {
    labels: trends.map(t => new Date(t.month).toLocaleDateString('fr-FR', { month: 'short' })),
    datasets: [
      {
        label: 'Revenus mensuels (TND)',
        data: trends.map(t => t.revenueGenerated || 0),
        borderColor: institutionalTheme.palette.primary.main,
        backgroundColor: `${institutionalTheme.palette.primary.main}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const offersChartData = {
    labels: ['Acceptées', 'En cours d\'évaluation', 'Rejetées'],
    datasets: [
      {
        data: [stats.acceptedOffers || 0, stats.pendingOffers || 0, stats.rejectedOffers || 0],
        backgroundColor: [
          institutionalTheme.palette.success.main,
          institutionalTheme.palette.warning.main,
          institutionalTheme.palette.error.main,
        ],
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle, action }) => (
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
      onClick={action}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 28, color }} />
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {change > 0 ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: institutionalTheme.palette.success.main }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: institutionalTheme.palette.error.main }} />
            )}
            <Typography variant="caption" sx={{ color: change > 0 ? institutionalTheme.palette.success.main : institutionalTheme.palette.error.main }}>
              {Math.abs(change)}% par rapport au mois dernier
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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

      {/* Desktop Drawer */}
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
              sx={{ mx: 1, mb: 0.5, borderRadius: 1 }}
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
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              onClose={() => setError(null)}
              action={
                <Button color="inherit" size="small" onClick={fetchDashboardData}>
                  إعادة المحاولة
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: institutionalTheme.palette.primary.main }}>
                Tableau de Bord Fournisseur
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Bienvenue, {user?.company_name || user?.username}
              </Typography>
            </Box>
            <IconButton onClick={fetchDashboardData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Taux de Réussite
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={analytics.winRate || 0}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {(analytics.winRate || 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Note Moyenne
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: `${institutionalTheme.palette.warning.main}20`, width: 56, height: 56 }}>
                      <StarIcon sx={{ fontSize: 32, color: institutionalTheme.palette.warning.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {(analytics.avgRating || 0).toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        sur {analytics.totalReviews || 0} avis
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Revenus Mensuels
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    État des Offres
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut
                      data={offersChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Commandes Récentes
                  </Typography>
                  {recentOrders.length > 0 ? (
                    <List>
                      {recentOrders.map((order, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${institutionalTheme.palette.success.main}20` }}>
                              <ShoppingCartIcon sx={{ color: institutionalTheme.palette.success.main }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={order.po_number || `طلب #${order.id}`}
                            secondary={`${order.tender_title} - ${new Intl.NumberFormat('ar-TN', { style: 'currency', currency: 'TND' }).format(order.total_amount)}`}
                          />
                          <Chip
                            label={order.status === 'confirmed' ? 'Confirmé' : 'En traitement'}
                            size="small"
                            color={order.status === 'confirmed' ? 'success' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucune commande pour le moment</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Appels d'Offres Disponibles
                  </Typography>
                  {recentTenders.length > 0 ? (
                    <List>
                      {recentTenders.map((tender, index) => (
                        <ListItem
                          key={index}
                          sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                          onClick={() => navigate(`/tender/${tender.id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${institutionalTheme.palette.primary.main}20` }}>
                              <GavelIcon sx={{ color: institutionalTheme.palette.primary.main }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={tender.title}
                            secondary={`Échéance: ${new Date(tender.deadline).toLocaleDateString('fr-FR')}`}
                          />
                          <Button variant="outlined" size="small">
                            Voir
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucun appel d'offres disponible</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: institutionalTheme.palette.divider }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
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
                      },
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
                        Découvrez de nouvelles opportunités
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
                      },
                    }}
                    onClick={() => navigate('/my-offers')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.success.main}15` }}>
                        <LocalOfferIcon sx={{ color: institutionalTheme.palette.success.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Gérer les Offres
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Suivez vos offres
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
                      },
                    }}
                    onClick={() => navigate('/supplier-analytics')}
                  >
                    <Stack spacing={1.5}>
                      <Avatar sx={{ backgroundColor: `${institutionalTheme.palette.info.main}15` }}>
                        <AssessmentIcon sx={{ color: institutionalTheme.palette.info.main }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Analyses et Rapports
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Analysez vos performances
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
};

export default SupplierDashboard;
