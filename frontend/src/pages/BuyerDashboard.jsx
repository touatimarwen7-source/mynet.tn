import { useState, useEffect } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTenders: 0,
    totalBids: 0,
    totalSavings: 0,
    bidVelocity: 0
  });
  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Tableau de Bord Acheteur');
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tenderRes = await procurementAPI.getMyTenders({ status: 'active' });
      const tenders = tenderRes.data.tenders || [];
      
      let totalBids = 0;
      let totalBudget = 0;
      let totalSpent = 0;

      tenders.forEach(t => {
        totalBudget += t.budget_max || 0;
        totalSpent += t.budget_spent || 0;
      });

      const bidVelocity = tenders.length > 0 ? (totalBids / tenders.length).toFixed(1) : 0;
      const savings = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget * 100).toFixed(2) : 0;

      setStats({
        activeTenders: tenders.length,
        totalBids: totalBids,
        totalSavings: savings,
        bidVelocity: bidVelocity
      });
      
      setRecentTenders(tenders.slice(0, 10));
    } catch (error) {
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

  const StatCard = ({ label, value, subtitle, icon, progress }) => (
    <Card sx={{ border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Typography sx={{ fontSize: '48px' }}>{icon}</Typography>
          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: theme.palette.primary.main }}>
            {value}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
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
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
            Tableau de Bord Acheteur
          </Typography>
          <Typography sx={{ color: '#616161', marginBottom: '16px' }}>
            Gérez vos appels d'offres et vos achats
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '20px', color: theme.palette.primary.main, marginRight: '8px' }} />}
            onClick={() => navigate('/create-tender')}
            sx={{
              backgroundColor: theme.palette.primary.main,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#0d47a1' },
            }}
          >
            Créer un Appel d'Offres
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard 
              label="Appels d'Offres Actifs"
              value={stats.activeTenders}
              subtitle="En cours"
              icon="📋"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard 
              label="Offres Reçues"
              value={stats.totalBids}
              subtitle="Total"
              icon="📊"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard 
              label="Économies"
              value={`${stats.totalSavings}%`}
              subtitle="Du budget"
              icon="💰"
              progress={Math.min(parseInt(stats.totalSavings) || 0, 100)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard 
              label="Vélocité"
              value={`${stats.bidVelocity}x`}
              subtitle="Offres/Appel"
              icon="⚡"
            />
          </Grid>
        </Grid>

        {/* Recent Tenders */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: 0 }}>
            <Box sx={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121' }}>
                Appels d'Offres Récents
              </Typography>
            </Box>
            <Paper sx={{ border: 'none', borderRadius: 0, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow sx={{ height: '56px' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', fontSize: '12px' }}>
                      Titre
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', fontSize: '12px' }} align="right">
                      Budget
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', fontSize: '12px' }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', fontSize: '12px' }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTenders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', padding: '32px', color: '#999' }}>
                        Aucun appel d'offres pour le moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTenders.map((tender) => (
                      <TableRow
                        key={tender.id}
                        sx={{
                          height: '56px',
                          borderBottom: '1px solid #e0e0e0',
                          '&:hover': { backgroundColor: '#fafafa' },
                        }}
                      >
                        <TableCell sx={{ color: '#212121', fontSize: '14px', fontWeight: 500 }}>
                          {tender.title}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.primary.main, fontSize: '14px', fontWeight: 600 }} align="right">
                          {tender.budget_max} TND
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tender.status === 'active' ? 'Actif' : 'Clôturé'}
                            sx={{
                              backgroundColor: tender.status === 'active' ? '#e8f5e9' : '#ffebee',
                              color: tender.status === 'active' ? '#1b5e20' : '#c62828',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon sx={{ fontSize: '20px', color: theme.palette.primary.main, marginRight: '8px' }} />}
                            onClick={() => navigate(`/tender/${tender.id}`)}
                            sx={{
                              color: theme.palette.primary.main,
                              textTransform: 'none',
                              fontWeight: 500,
                            }}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
