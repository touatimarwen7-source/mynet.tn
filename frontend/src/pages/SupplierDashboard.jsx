/**
 * لوحة تحكم المزود - Supplier Dashboard
 * عرض الأطراف المتاحة والعروض المقدمة والإحصائيات
 * @component
 * @returns {JSX.Element} عنصر لوحة تحكم المزود
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import EarningsIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
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
 * Dashboard Content - Supplier Dashboard Implementation
 */
function SupplierDashboardContent() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [stats, setStats] = useState({
    activeOffers: 0,
    totalRevenue: 0,
    winRate: 0,
    completedDeals: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [recentTenders, setRecentTenders] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setPageTitle(t('dashboard.supplier.title'));
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tendersRes = await procurementAPI.getTenders({ status: 'active' });
      const tenders = tendersRes.data?.data || [];
      setRecentTenders(tenders.slice(0, 8));

      const offersRes = await procurementAPI.getOffers();
      const offers = offersRes.data?.data || [];
      setMyOffers(offers.slice(0, 6));

      const winRate = offers.length > 0 
        ? ((offers.filter(o => o.status === 'won').length / offers.length) * 100).toFixed(1)
        : 0;

      const totalRevenue = offers
        .filter(o => o.status === 'won')
        .reduce((sum, o) => sum + (o.financial_proposal?.total || 0), 0);

      setStats({
        activeOffers: offers.filter(o => o.status === 'pending').length,
        totalRevenue: totalRevenue.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }),
        winRate: winRate,
        completedDeals: offers.filter(o => o.status === 'won').length,
      });
    } catch (error) {
      logger.error(t('dashboard.supplier.loadError'), error);
      setSnackbar({ open: true, message: t('dashboard.errors.loadingFailed'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  const StatCard = ({ label, value, subtitle, icon, color = theme.palette.primary.main }) => (
    <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Box sx={{ fontSize: '32px', color }}>{icon}</Box>
          <Typography sx={{ fontSize: '28px', fontWeight: 600, color }}>
            {value}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.palette.text.primary }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
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
              {t('dashboard.supplier.title')}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>
              {t('dashboard.supplier.subtitle')}
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            variant="outlined"
            size="small"
          >
            {t('common.refresh')}
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.supplier.activeOffers')}
              value={stats.activeOffers}
              subtitle={t('dashboard.supplier.awaitingEval')}
              icon={<ShoppingCartIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.supplier.earnedRevenue')}
              value={stats.totalRevenue}
              subtitle={t('dashboard.supplier.totalWon')}
              icon={<EarningsIcon />}
              color="#388e3c"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.supplier.winRate')}
              value={`${stats.winRate}%`}
              subtitle={t('dashboard.supplier.offersWon')}
              icon={<TrendingUpIcon />}
              color="#f57c00"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.supplier.completed')}
              value={stats.completedDeals}
              subtitle={t('dashboard.supplier.marketsWon')}
              icon={<VerifiedIcon />}
              color="#7b1fa2"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }
            }}
          >
            <Tab label={t('dashboard.supplier.tenders')} icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label={t('dashboard.supplier.myOffers')} icon={<ShoppingCartIcon />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
                  {t('dashboard.supplier.activeTenders')} ({recentTenders.length})
                </Typography>
                {recentTenders.length === 0 ? (
                  <Alert severity="info">{t('dashboard.supplier.noTenders')}</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.title')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.budget')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.deadline')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentTenders.map((tender) => (
                          <TableRow key={tender.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                            <TableCell sx={{ fontSize: '13px' }}>
                              <Typography sx={{ fontWeight: 500 }}>{tender.title}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '13px' }}>
                              {tender.budget_max?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
                            </TableCell>
                            <TableCell sx={{ fontSize: '13px' }}>
                              {new Date(tender.deadline).toLocaleDateString('fr-TN')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => navigate(`/procurement/tender/${tender.id}`)}
                                sx={{ textTransform: 'none', fontSize: '12px' }}
                              >
                                {t('common.details')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                    {t('dashboard.supplier.myOffers')} ({myOffers.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/procurement/create-offer')}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('dashboard.supplier.newOffer')}
                  </Button>
                </Box>
                {myOffers.length === 0 ? (
                  <Alert severity="info">{t('dashboard.supplier.noOffers')}</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('dashboard.supplier.tender')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.amount')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.status')}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myOffers.map((offer) => (
                          <TableRow key={offer.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                            <TableCell sx={{ fontSize: '13px' }}>
                              {offer.tender?.title || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '13px' }}>
                              {offer.financial_proposal?.total?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
                            </TableCell>
                            <TableCell sx={{ fontSize: '13px' }}>
                              <Chip
                                label={offer.status}
                                size="small"
                                color={offer.status === 'won' ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => navigate(`/procurement/offer/${offer.id}`)}
                                sx={{ textTransform: 'none', fontSize: '12px' }}
                              >
                                {t('common.view')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mt: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
              {t('dashboard.supplier.quickActions')}
            </Typography>
            <List>
              <ListItem 
                button 
                onClick={() => navigate('/procurement/tenders')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.supplier.browseTenders')}
                  secondary={t('dashboard.supplier.findOpportunities')}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => navigate('/profile')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <VerifiedIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.supplier.companyProfile')}
                  secondary={t('dashboard.supplier.updateInfo')}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => navigate('/messages')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.supplier.messaging')}
                  secondary={t('dashboard.supplier.communicateBuyers')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

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
export default function SupplierDashboard() {
  return (
    <EnhancedErrorBoundary>
      <SupplierDashboardContent />
    </EnhancedErrorBoundary>
  );
}
