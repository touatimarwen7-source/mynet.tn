import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Rating,
} from '@mui/material';
import { procurementAPI } from '../api/procurementApi';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { TableSkeleton } from '../components/SkeletonLoader';

export default function SupplierAnalytics() {
  const theme = institutionalTheme;
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, trendsRes] = await Promise.all([
        procurementAPI.getSupplierAnalytics(),
        procurementAPI.getSupplierTrends('6 months')
      ]);
      
      const mockAnalytics = {
        kpis: {
          totalOffers: 156,
          acceptedOffers: 94,
          averageRating: 4.6,
          revenue: 285600,
        },
        performanceByMonth: [
          { month: 'Jan', offers: 18, accepted: 11 },
          { month: 'Fev', offers: 22, accepted: 15 },
          { month: 'Mar', offers: 19, accepted: 12 },
          { month: 'Avr', offers: 25, accepted: 18 },
          { month: 'Mai', offices: 21, accepted: 14 },
          { month: 'Jun', offers: 26, accepted: 20 },
        ],
        recentOrders: [
          { id: 'CMD-001', buyer: 'Company A', amount: 5600, status: 'livré' },
          { id: 'CMD-002', buyer: 'Company B', amount: 8900, status: 'en_route' },
          { id: 'CMD-003', buyer: 'Company C', amount: 4200, status: 'confirme' },
          { id: 'CMD-004', buyer: 'Company D', amount: 12300, status: 'livré' },
          { id: 'CMD-005', buyer: 'Company E', amount: 6800, status: 'en_route' },
        ],
      };
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}
          >
            Analytics - Fournisseur
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} sx={{ height: '120px' }}>
                <CardContent />
              </Card>
            ))}
          </Box>
          <TableSkeleton rows={5} columns={3} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '32px' }}
        >
          Dashboard Analytics - Fournisseur
        </Typography>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid xs={12} lg={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Offres Totales</Typography>
                    <AssignmentTurnedInIcon
                      sx={{ color: theme.palette.primary.main, fontSize: '24px' }}
                    />
                  </Box>
                  <Typography
                    sx={{ fontSize: '28px', fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    {analytics.kpis.totalOffers}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#999' }}>
                    {analytics.kpis.acceptedOffers} acceptées
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} lg={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Note Moyenne</Typography>
                    <StarIcon sx={{ color: '#f57c00', fontSize: '24px' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#f57c00' }}>
                      {analytics.kpis.averageRating}
                    </Typography>
                    <Rating value={analytics.kpis.averageRating} readOnly size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} lg={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Revenu Total</Typography>
                    <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#2e7d32' }}>
                    {(analytics.kpis.revenue / 1000).toFixed(1)}K TND
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} lg={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                      Taux Acceptation
                    </Typography>
                    <LocalShippingIcon sx={{ color: '#0288d1', fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#0288d1' }}>
                    {Math.round((analytics.kpis.acceptedOffers / analytics.kpis.totalOffers) * 100)}
                    %
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Chart */}
        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography
              sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}
            >
              Performance Mensuelle
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
              }}
            >
              {analytics.performanceByMonth.map((month, i) => (
                <Box
                  key={i}
                  sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                >
                  <Typography sx={{ fontWeight: 600, marginBottom: '8px' }}>
                    {month.month}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Offres:{' '}
                    <span style={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {month.offers}
                    </span>
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Acceptées:{' '}
                    <span style={{ fontWeight: 600, color: '#2e7d32' }}>{month.accepted}</span>
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography
              sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}
            >
              Commandes Récentes
            </Typography>
            <Paper sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>N° Commande</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Acheteur</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        {order.id}
                      </TableCell>
                      <TableCell>{order.buyer}</TableCell>
                      <TableCell>{order.amount.toLocaleString()} TND</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: order.status === 'livré' ? '#e8f5e9' : '#fff3e0',
                            color: order.status === 'livré' ? '#2e7d32' : '#e65100',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {order.status === 'livré'
                            ? 'Livrée'
                            : order.status === 'en_route'
                              ? 'En Route'
                              : 'Confirmée'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
