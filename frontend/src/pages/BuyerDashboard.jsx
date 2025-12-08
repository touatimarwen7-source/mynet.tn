
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
    setPageTitle('Tableau de Bord Acheteur');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, analyticsResponse] = await Promise.allSettled([
        procurementAPI.buyer.getDashboardStats(),
        procurementAPI.buyer.getAnalytics()
      ]);

      if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
        setStats({
          activeTenders: statsResponse.value.data.activeTenders || 0,
          totalOffers: statsResponse.value.data.totalOffers || 0,
          completedTenders: statsResponse.value.data.completedTenders || 0,
          pendingEvaluations: statsResponse.value.data.pendingEvaluations || 0,
        });
      }

      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value?.data?.analytics) {
        console.log('Analytics loaded:', analyticsResponse.value.data.analytics);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données du tableau de bord:', err);
      setError('Échec du chargement des données. Veuillez réessayer.');
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
