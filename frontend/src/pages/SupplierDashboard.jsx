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
  LinearProgress,
  Chip,
  Paper,
  Rating,
} from '@mui/material';
import { procurementAPI } from '../api/procurementApi';
import {
  LocalOffer as OfferIcon,
  Assessment as AnalyticsIcon,
  Inventory as ProductsIcon,
  Star as ReviewsIcon,
  TrendingUp,
  TrendingDown,
  Search as SearchIcon,
  MonetizationOn as RevenueIcon,
  Schedule as PendingIcon,
  CheckCircle as WonIcon,
  Cancel as LostIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import institutionalTheme from '../theme/theme';
import { setPageTitle } from '../utils/pageTitle';
import EnhancedTable from '../components/EnhancedTable';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const theme = institutionalTheme;

  useEffect(() => {
    setPageTitle('Tableau de Bord Fournisseur - MyNet.tn');
  }, []);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await procurementAPI.getSupplierDashboardStats();
        setDashboardStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardStats ? [
    { 
      label: 'Offres Soumises', 
      value: dashboardStats.totalOffers || 0, 
      change: 12.5,
      trend: 'up',
      icon: OfferIcon, 
      color: theme.palette.primary.main,
      subtitle: `${dashboardStats.pendingOffers || 0} en attente`
    },
    { 
      label: 'Taux de Victoire', 
      value: dashboardStats.totalOffers > 0 
        ? `${Math.round((dashboardStats.acceptedOffers / dashboardStats.totalOffers) * 100)}%`
        : '0%', 
      change: 5.2,
      trend: 'up',
      icon: WonIcon, 
      color: theme.palette.success.main,
      subtitle: `${dashboardStats.acceptedOffers || 0} sur ${dashboardStats.totalOffers || 0} offres`
    },
    { 
      label: 'Revenus Prévus', 
      value: `${((dashboardStats.totalRevenue || 0) / 1000).toFixed(1)}K TND`, 
      change: 18.3,
      trend: 'up',
      icon: RevenueIcon, 
      color: theme.palette.info.main,
      subtitle: 'Des offres gagnées'
    },
    { 
      label: 'Appels Disponibles', 
      value: dashboardStats.availableTenders || 0, 
      change: 3.1,
      trend: 'up',
      icon: SearchIcon, 
      color: theme.palette.warning.main,
      subtitle: 'Opportunités actives'
    },
  ] : [];

  const offerStatusData = [
    { name: 'Gagnant', value: 13, color: theme.palette.success.main },
    { name: 'En Évaluation', value: 3, color: theme.palette.warning.main },
    { name: 'Rejeté', value: 2, color: theme.palette.error.main },
  ];

  const monthlyRevenue = [
    { month: 'Janvier', revenue: 240, offers: 3 },
    { month: 'Février', revenue: 380, offers: 5 },
    { month: 'Mars', revenue: 520, offers: 6 },
    { month: 'Avril', revenue: 290, offers: 4 },
    { month: 'Mai', revenue: 650, offers: 8 },
    { month: 'Juin', revenue: 480, offers: 5 },
  ];

  const recentOffers = [
    { 
      id: 1, 
      tender: 'Fourniture équipements bureau', 
      amount: '145,000 TND',
      status: 'Gagnant', 
      date: '2025-01-05',
      rating: 5
    },
    { 
      id: 2, 
      tender: 'Services maintenance complète', 
      amount: '280,000 TND',
      status: 'En Évaluation', 
      date: '2025-01-03',
      rating: null
    },
    { 
      id: 3, 
      tender: 'Achat ordinateurs', 
      amount: '420,000 TND',
      status: 'Gagnant', 
      date: '2024-12-28',
      rating: 4.5
    },
  ];

  const tableColumns = [
    { key: 'tender', label: 'Appel d\'Offre' },
    { key: 'amount', label: 'Montant Offre' },
    { 
      key: 'status', 
      label: 'Statut',
      render: (val) => (
        <Chip 
          label={val} 
          size="small"
          color={
            val === 'Gagnant' ? 'success' : 
            val === 'En Évaluation' ? 'warning' : 
            'error'
          }
          sx={{ fontWeight: 600 }}
        />
      )
    },
    { key: 'date', label: 'Date' },
    {
      key: 'rating',
      label: 'Note',
      render: (val) => val ? <Rating value={val} readOnly size="small" /> : <Typography variant="caption">-</Typography>
    },
  ];

  const quickActions = [
    { 
      label: 'Parcourir les Appels', 
      path: '/tenders', 
      color: 'primary',
      icon: SearchIcon,
      description: 'Découvrez de nouvelles opportunités'
    },
    { 
      label: 'Mes Offres', 
      path: '/my-offers', 
      color: 'secondary',
      icon: OfferIcon,
      description: 'Gérer les offres soumises'
    },
    { 
      label: 'Produits et Services', 
      path: '/supplier-products', 
      color: 'info',
      icon: ProductsIcon,
      description: 'Catalogue de produits'
    },
    { 
      label: 'Analyses', 
      path: '/supplier-analytics', 
      color: 'success',
      icon: AnalyticsIcon,
      description: 'Rapports de performance'
    },
    { 
      label: 'Factures', 
      path: '/supplier-invoices', 
      color: 'warning',
      icon: MonetizationOn,
      description: 'Gestion des factures'
    },
    { 
      label: 'Demandes d\'Achat', 
      path: '/supplier-requests', 
      color: 'error',
      icon: ShoppingCartIcon,
      description: 'Demandes des clients'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                mb: 1 
              }}
            >
              Tableau de Bord Fournisseur
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gestion professionnelle des offres et produits
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            size="large"
            onClick={() => navigate('/tenders')}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Parcourir les Appels d'Offres
          </Button>
        </Stack>
      </Box>

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
                  {stat.trend === 'up' ? (
                    <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: stat.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600
                    }}
                  >
                    {Math.abs(stat.change)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    vs mois dernier
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trends */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Revenus et Offres Mensuels
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill={theme.palette.primary.main} name="Revenus (milliers)" />
                  <Bar dataKey="offers" fill={theme.palette.success.main} name="Nombre d'offres" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Offer Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Statut des Offres
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offerStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {offerStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
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
          <Grid container spacing={2}>
            {quickActions.map((action, idx) => (
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
        </CardContent>
      </Card>

      {/* Recent Offers Table */}
      <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Offres Récentes
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/my-offers')}
              sx={{ textTransform: 'none' }}
            >
              Voir Tout
            </Button>
          </Stack>
          <EnhancedTable
            data={recentOffers}
            columns={tableColumns}
            onRowClick={(row) => navigate(`/tender/${row.id}`)}
            striped
          />
        </CardContent>
      </Card>
    </Container>
  );
}