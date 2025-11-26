/**
 * لوحة تحكم المشتري - Buyer Dashboard
 * عرض إحصائيات الأطراف والعروض والتحليلات المالية
 * @component
 * @returns {JSX.Element} عنصر لوحة تحكم المشتري
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
  LinearProgress,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TablePagination,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
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
 * Confirmation Dialog component
 */
const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography sx={{ mt: 2 }}>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Annuler</Button>
      <Button onClick={onConfirm} variant="contained" color="error">
        Confirmer
      </Button>
    </DialogActions>
  </Dialog>
);

/**
 * Dashboard Content - Buyer Dashboard Implementation
 */
function BuyerDashboardContent() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [stats, setStats] = useState({
    activeTenders: 0,
    totalOffers: 0,
    averageSavings: 0,
    pendingDecisions: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [myTenders, setMyTenders] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, tenderId: null });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setPageTitle(t('dashboard.buyer.title'));
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tendersRes = await procurementAPI.getMyTenders();
      const tenders = tendersRes.data?.tenders || [];
      setMyTenders(tenders.slice(0, 8));

      let totalOffers = 0;
      let totalBudget = 0;
      let totalSpent = 0;
      let pendingCount = 0;

      for (const tender of tenders) {
        try {
          const offersRes = await procurementAPI.getTenderOffers(tender.id);
          const offers = offersRes.data?.data || [];
          totalOffers += offers.length;
          totalBudget += tender.budget_max || 0;
          totalSpent += offers.reduce((sum, o) => sum + (o.financial_proposal?.total || 0), 0);
          if (tender.status === 'open') pendingCount += 1;
        } catch (error) {
          logger.warn('Erreur lors du chargement des offres pour le tender', { tenderId: tender.id });
        }
      }

      const avgSavings = totalBudget > 0 
        ? (((totalBudget - totalSpent) / totalBudget) * 100).toFixed(2)
        : 0;

      setStats({
        activeTenders: tenders.filter(t => t.status === 'open').length,
        totalOffers: totalOffers,
        averageSavings: avgSavings,
        pendingDecisions: pendingCount,
      });

      setRecentOffers(tenders.slice(0, 5));
    } catch (error) {
      logger.error('Erreur lors du chargement des données du tableau de bord', error);
      setError(error.message);
      setSnackbar({ open: true, message: t('dashboard.errors.loadingFailed'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTender = async (tenderId) => {
    try {
      await procurementAPI.publishTender(tenderId);
      setSnackbar({ open: true, message: t('dashboard.buyer.publishSuccess'), severity: 'success' });
      fetchDashboardData();
    } catch (error) {
      logger.error('Erreur lors de la publication du tender', error);
      setSnackbar({ open: true, message: t('dashboard.errors.publishFailed'), severity: 'error' });
    }
  };

  const handleCloseTender = async (tenderId) => {
    try {
      await procurementAPI.closeTender(tenderId);
      setSnackbar({ open: true, message: t('dashboard.buyer.closeSuccess'), severity: 'success' });
      fetchDashboardData();
    } catch (error) {
      logger.error('Erreur lors de la fermeture du tender', error);
      setSnackbar({ open: true, message: t('dashboard.errors.closeFailed'), severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  const StatCard = ({ label, value, subtitle, icon, progress, color }) => (
    <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Box sx={{ fontSize: '32px', color: color || theme.palette.primary.main }}>{icon}</Box>
          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: color || theme.palette.primary.main }}>
            {value}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.palette.text.primary }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
          {subtitle}
        </Typography>
        {progress !== undefined && (
          <LinearProgress variant="determinate" value={progress} sx={{ marginTop: '12px' }} />
        )}
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
              {t('dashboard.buyer.title')}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>
              {t('dashboard.buyer.subtitle')}
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
              label={t('dashboard.buyer.activeTenders')}
              value={stats.activeTenders}
              subtitle={t('dashboard.buyer.evaluating')}
              icon={<AssignmentIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.buyer.offersReceived')}
              value={stats.totalOffers}
              subtitle={t('dashboard.buyer.total')}
              icon={<ShoppingCartIcon />}
              color="#388e3c"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.buyer.savings')}
              value={`${stats.averageSavings}%`}
              subtitle={t('dashboard.buyer.budgetSaved')}
              icon={<TrendingDownIcon />}
              color="#f57c00"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard 
              label={t('dashboard.buyer.pending')}
              value={stats.pendingDecisions}
              subtitle={t('dashboard.buyer.decisionsRequired')}
              icon={<TimelineIcon />}
              color="#d32f2f"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '24px' }}>
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
            <Tab label={t('dashboard.buyer.myTenders')} icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label={t('dashboard.buyer.receivedOffers')} icon={<ShoppingCartIcon />} iconPosition="start" />
            <Tab label={t('dashboard.buyer.analysis')} icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                    {t('dashboard.buyer.myTenders')} ({myTenders.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/procurement/create-tender')}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('dashboard.buyer.newCall')}
                  </Button>
                </Box>
                {myTenders.length === 0 ? (
                  <Alert severity="info">{t('dashboard.buyer.noTenders')}</Alert>
                ) : (
                  <Box>
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }} role="alert">
                        {error}
                      </Alert>
                    )}
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small" aria-label={t('dashboard.buyer.myTenders')}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px' }} scope="col">{t('common.title')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px' }} scope="col">{t('common.budget')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px' }} scope="col">{t('common.status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px' }} scope="col">{t('common.offers')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '12px' }} scope="col">{t('common.actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {myTenders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tender) => (
                            <TableRow key={tender.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                              <TableCell sx={{ fontSize: '13px' }}>
                                <Typography sx={{ fontWeight: 500 }}>{tender.title}</Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: '13px' }}>
                                {tender.budget_max?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
                              </TableCell>
                              <TableCell sx={{ fontSize: '13px' }}>
                                <Chip 
                                  label={tender.status} 
                                  size="small"
                                  color={tender.status === 'open' ? 'warning' : 'default'}
                                  variant="outlined"
                                  aria-label={`Statut: ${tender.status}`}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: '13px' }}>
                                <Chip 
                                  label={`${tender.offers_count || 0}`}
                                  size="small"
                                  aria-label={`${tender.offers_count || 0} offres`}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => {
                                    setSelectedTender(tender);
                                    setDetailsOpen(true);
                                  }}
                                  sx={{ textTransform: 'none', fontSize: '12px' }}
                                  aria-label={`Voir détails de ${tender.title}`}
                                >
                                  {t('common.details')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={myTenders.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(event, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                      }}
                      labelRowsPerPage={t('common.rowsPerPage') || 'Lignes par page:'}
                    />
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
                  {t('dashboard.buyer.recentOffers')}
                </Typography>
                {recentOffers.length === 0 ? (
                  <Alert severity="info">{t('dashboard.buyer.noOffers')}</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {recentOffers.map((tender) => (
                      <Grid xs={12} sm={6} md={4} key={tender.id}>
                        <Card sx={{ border: '1px solid #e0e0e0' }}>
                          <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1 }}>
                              {tender.title}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#616161', mb: 2 }}>
                              {tender.offers_count || 0} {t('dashboard.buyer.offersReceived')}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/procurement/tender/${tender.id}/offers`)}
                              sx={{ textTransform: 'none' }}
                            >
                              {t('dashboard.buyer.viewOffers')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <Card sx={{ border: '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                          {t('dashboard.buyer.offerTrends')}
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.avgOfferRate')}
                              secondary={stats.totalOffers > 0 ? `${(stats.totalOffers / Math.max(stats.activeTenders, 1)).toFixed(1)} offres par appel` : 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.avgOfferTime')}
                              secondary="5.2 jours"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.activeSuppliers')}
                              secondary="12 fournisseurs"
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
                          {t('dashboard.buyer.financialSummary')}
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.totalBudget')}
                              secondary="250,000 TND"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.spent')}
                              secondary="186,500 TND"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={t('dashboard.buyer.savings')}
                              secondary="63,500 TND (25.4%)"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
              {t('dashboard.buyer.quickActions')}
            </Typography>
            <List>
              <ListItem 
                button 
                onClick={() => navigate('/procurement/create-tender')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.buyer.createNew')}
                  secondary={t('dashboard.buyer.createNewDesc')}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => navigate('/procurement/tenders')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.buyer.viewAll')}
                  secondary={t('dashboard.buyer.viewAllDesc')}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => navigate('/reports')}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  <FileDownloadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard.buyer.generateReport')}
                  secondary={t('dashboard.buyer.generateReportDesc')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('dashboard.buyer.tenderDetails')}</DialogTitle>
          <DialogContent>
            {selectedTender && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1 }}><strong>{t('common.title')}:</strong> {selectedTender.title}</Typography>
                <Typography sx={{ mb: 1 }}><strong>{t('common.budget')}:</strong> {selectedTender.budget_max?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}</Typography>
                <Typography sx={{ mb: 1 }}><strong>{t('common.status')}:</strong> {selectedTender.status}</Typography>
                <Typography sx={{ mb: 1 }}><strong>{t('common.offers')}:</strong> {selectedTender.offers_count || 0}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>{t('common.close')}</Button>
            {selectedTender?.status === 'draft' && (
              <Button 
                variant="contained" 
                onClick={() => {
                  handlePublishTender(selectedTender.id);
                  setDetailsOpen(false);
                }}
              >
                {t('dashboard.buyer.publish')}
              </Button>
            )}
            {selectedTender?.status === 'open' && (
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  setConfirmDialog({ 
                    open: true, 
                    action: 'close', 
                    tenderId: selectedTender.id 
                  });
                }}
              >
                {t('dashboard.buyer.close')}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={confirmDialog.open}
          title={t('dashboard.buyer.confirmClose')}
          message={t('dashboard.buyer.confirmCloseMsg')}
          onConfirm={() => {
            if (confirmDialog.action === 'close') {
              handleCloseTender(confirmDialog.tenderId);
              setDetailsOpen(false);
            }
            setConfirmDialog({ open: false, action: null, tenderId: null });
          }}
          onCancel={() => setConfirmDialog({ open: false, action: null, tenderId: null })}
        />

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
export default function BuyerDashboard() {
  return (
    <EnhancedErrorBoundary>
      <BuyerDashboardContent />
    </EnhancedErrorBoundary>
  );
}
