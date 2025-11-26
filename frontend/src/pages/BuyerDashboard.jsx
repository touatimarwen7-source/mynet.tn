import { useState, useEffect } from 'react';
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
  Paper,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function BuyerDashboard() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
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

  useEffect(() => {
    setPageTitle('Tableau de Bord Acheteur');
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch my tenders
      const tendersRes = await procurementAPI.getMyTenders();
      const tenders = tendersRes.data?.tenders || [];
      setMyTenders(tenders.slice(0, 8));

      // Fetch offers for my tenders
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
        } catch {
          // Skip if error
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

      // Fetch recent offers
      setRecentOffers(tenders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTender = async (tenderId) => {
    try {
      await procurementAPI.publishTender(tenderId);
      alert('Appel d\'offre publié avec succès!');
      fetchDashboardData();
    } catch (error) {
      alert('Erreur lors de la publication');
    }
  };

  const handleCloseTender = async (tenderId) => {
    if (window.confirm('Êtes-vous sûr de fermer cet appel d\'offre?')) {
      try {
        await procurementAPI.closeTender(tenderId);
        alert('Appel d\'offre fermé avec succès!');
        fetchDashboardData();
      } catch (error) {
        alert('Erreur lors de la fermeture');
      }
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
        <Box sx={{ marginBottom: '32px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: theme.palette.primary.main,
              marginBottom: '8px',
            }}
          >
            Tableau de Bord Acheteur
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>
            Gérez vos appels d'offres et analysez vos offres reçues
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Appels Actifs" 
              value={stats.activeTenders}
              subtitle="En cours d'évaluation"
              icon={<AssignmentIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Offres Reçues" 
              value={stats.totalOffers}
              subtitle="Au total"
              icon={<ShoppingCartIcon />}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Économies" 
              value={`${stats.averageSavings}%`}
              subtitle="Budget sauvegardé"
              icon={<TrendingDownIcon />}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="En Attente" 
              value={stats.pendingDecisions}
              subtitle="Décisions requises"
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
            <Tab label="Mes Appels d'Offres" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Offres Reçues" icon={<ShoppingCartIcon />} iconPosition="start" />
            <Tab label="Analyse" icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                    Mes Appels d'Offres ({myTenders.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/procurement/create-tender')}
                    sx={{ textTransform: 'none' }}
                  >
                    Nouvel Appel
                  </Button>
                </Box>
                {myTenders.length === 0 ? (
                  <Alert severity="info">Vous n'avez créé aucun appel d'offre</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Titre</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Budget</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Offres</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myTenders.map((tender) => (
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
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '13px' }}>
                              <Chip 
                                label={`${tender.offers_count || 0}`}
                                size="small"
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
                              >
                                Détails
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
                <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
                  Offres Récentes Reçues
                </Typography>
                {recentOffers.length === 0 ? (
                  <Alert severity="info">Aucune offre reçue</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {recentOffers.map((tender) => (
                      <Grid item xs={12} sm={6} md={4} key={tender.id}>
                        <Card sx={{ border: '1px solid #e0e0e0' }}>
                          <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1 }}>
                              {tender.title}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#616161', mb: 2 }}>
                              {tender.offers_count || 0} offres reçues
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/procurement/tender/${tender.id}/offers`)}
                              sx={{ textTransform: 'none' }}
                            >
                              Voir les Offres
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
                  <Grid item xs={12} md={6}>
                    <Card sx={{ border: '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                          Tendances d'Offres
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Taux d'Offre Moyen"
                              secondary={stats.totalOffers > 0 ? `${(stats.totalOffers / Math.max(stats.activeTenders, 1)).toFixed(1)} offres par appel` : 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Temps Moyen d'Offre"
                              secondary="5.2 jours"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Fournisseurs Actifs"
                              secondary="12 fournisseurs"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ border: '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>
                          Résumé Financier
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Budget Total"
                              secondary="250,000 TND"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Dépensé"
                              secondary="186,500 TND"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Économies"
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
              Actions Rapides
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
                  primary="Créer un Nouvel Appel d'Offre"
                  secondary="Lancez une nouvelle procédure d'achat"
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
                  primary="Voir Tous les Appels"
                  secondary="Gérez vos appels d'offres"
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
                  primary="Générer un Rapport"
                  secondary="Téléchargez des rapports d'achat"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Détails de l'Appel d'Offre</DialogTitle>
          <DialogContent>
            {selectedTender && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1 }}><strong>Titre:</strong> {selectedTender.title}</Typography>
                <Typography sx={{ mb: 1 }}><strong>Budget:</strong> {selectedTender.budget_max?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}</Typography>
                <Typography sx={{ mb: 1 }}><strong>Statut:</strong> {selectedTender.status}</Typography>
                <Typography sx={{ mb: 1 }}><strong>Offres:</strong> {selectedTender.offers_count || 0}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Fermer</Button>
            {selectedTender?.status === 'draft' && (
              <Button 
                variant="contained" 
                onClick={() => {
                  handlePublishTender(selectedTender.id);
                  setDetailsOpen(false);
                }}
              >
                Publier
              </Button>
            )}
            {selectedTender?.status === 'open' && (
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  handleCloseTender(selectedTender.id);
                  setDetailsOpen(false);
                }}
              >
                Fermer
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
