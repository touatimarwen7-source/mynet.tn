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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import EarningsIcon from '@mui/icons-material/AttachMoney';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function SupplierDashboard() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
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

  useEffect(() => {
    setPageTitle('Tableau de Bord Fournisseur');
  }, []);

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
      console.error('Error fetching dashboard data:', error);
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
            Tableau de Bord Fournisseur
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>
            Gérez vos offres et suivez votre performance
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Offres Actives" 
              value={stats.activeOffers}
              subtitle="En attente d'évaluation"
              icon={<ShoppingCartIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Revenus Gagnés" 
              value={stats.totalRevenue}
              subtitle="Du total remporté"
              icon={<EarningsIcon />}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Taux de Victoire" 
              value={`${stats.winRate}%`}
              subtitle="Offres gagnées"
              icon={<TrendingUpIcon />}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Contrats Complétés" 
              value={stats.completedDeals}
              subtitle="Marchés remportés"
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
            <Tab label="Appels d'offres" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Mes Offres" icon={<ShoppingCartIcon />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
                  Appels d'Offres Actifs ({recentTenders.length})
                </Typography>
                {recentTenders.length === 0 ? (
                  <Alert severity="info">Aucun appel d'offre disponible</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Titre</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Budget</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Deadline</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Actions</TableCell>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                    Mes Offres ({myOffers.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/procurement/create-offer')}
                    sx={{ textTransform: 'none' }}
                  >
                    Nouvelle Offre
                  </Button>
                </Box>
                {myOffers.length === 0 ? (
                  <Alert severity="info">Vous n'avez soumis aucune offre</Alert>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Appel d'Offre</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Montant</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Actions</TableCell>
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
                                Voir
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
              Actions Rapides
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
                  primary="Parcourir les Appels d'Offres"
                  secondary="Trouvez de nouvelles opportunités"
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
                  primary="Profil de l'Entreprise"
                  secondary="Mettez à jour vos informations"
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
                  primary="Messagerie"
                  secondary="Communiquez avec les acheteurs"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
