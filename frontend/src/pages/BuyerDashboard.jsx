
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import axiosInstance from '../services/axiosConfig';

const DRAWER_WIDTH = 240;

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTenders: 0,
    totalOffers: 0,
    completedTenders: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPageTitle('لوحة تحكم المشتري');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/procurement/buyer/dashboard-stats');

      if (response?.data) {
        setStats({
          activeTenders: response.data.activeTenders || 0,
          totalOffers: response.data.totalOffers || 0,
          completedTenders: response.data.completedTenders || 0,
          pendingEvaluations: response.data.pendingEvaluations || 0,
        });
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', err);
      setError('فشل تحميل البيانات. يرجى المحاولة مرة أخرى.');
      setStats({
        activeTenders: 0,
        totalOffers: 0,
        completedTenders: 0,
        pendingEvaluations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/buyer-dashboard' },
    { text: 'المناقصات', icon: <GavelIcon />, path: '/tenders' },
    { text: 'إنشاء مناقصة', icon: <AddIcon />, path: '/create-tender' },
    { text: 'العروض المستلمة', icon: <LocalOfferIcon />, path: '/buyer-active-tenders' },
    { text: 'التقارير المالية', icon: <AssessmentIcon />, path: '/financial-reports' },
    { text: 'الميزانيات', icon: <AccountBalanceIcon />, path: '/budgets' },
    { text: 'إدارة الفريق', icon: <PeopleIcon />, path: '/team-management' },
    { text: 'الملف الشخصي', icon: <PersonIcon />, path: '/profile' },
    { text: 'الإعدادات', icon: <SettingsIcon />, path: '/settings' },
  ];

  const dashboardCards = [
    {
      title: 'المناقصات النشطة',
      value: stats.activeTenders,
      icon: <Description sx={{ fontSize: 40, color: institutionalTheme.palette.primary.main }} />,
      color: institutionalTheme.palette.primary.main,
      action: () => navigate('/buyer-active-tenders'),
    },
    {
      title: 'إجمالي العروض',
      value: stats.totalOffers,
      icon: <TrendingUp sx={{ fontSize: 40, color: '#2196f3' }} />,
      color: '#2196f3',
      action: () => navigate('/buyer/offers'),
    },
    {
      title: 'المناقصات المكتملة',
      value: stats.completedTenders,
      icon: <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />,
      color: '#4caf50',
      action: () => navigate('/buyer/completed-tenders'),
    },
    {
      title: 'التقييمات المعلقة',
      value: stats.pendingEvaluations,
      icon: <Schedule sx={{ fontSize: 40, color: '#ff9800' }} />,
      color: '#ff9800',
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
              لوحة تحكم المشتري
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
              إنشاء مناقصة جديدة
            </Button>
          </Box>

          <Grid container spacing={3}>
            {dashboardCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `2px solid ${card.color}20`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 16px ${card.color}30`,
                      borderColor: card.color,
                    },
                  }}
                  onClick={card.action}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: card.color }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Box>{card.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              الإجراءات السريعة
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/create-tender')}
                  sx={{ py: 2 }}
                >
                  إنشاء مناقصة جديدة
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/buyer-active-tenders')}
                  sx={{ py: 2 }}
                >
                  عرض المناقصات النشطة
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/buyer-analytics')}
                  sx={{ py: 2 }}
                >
                  التقارير والتحليلات
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
