import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaidIcon from '@mui/icons-material/Paid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { TableSkeleton } from '../components/SkeletonLoader';

export default function BuyerAnalytics() {
  const theme = institutionalTheme;
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      const mockAnalytics = {
        kpis: {
          totalTenders: 45,
          activeOffers: 23,
          totalSpent: 125500,
          avgSpend: 2789,
        },
        monthlySpending: [
          { month: 'Jan', spend: 8500 },
          { month: 'Fev', spend: 12300 },
          { month: 'Mar', spend: 9800 },
          { month: 'Avr', spend: 15600 },
          { month: 'Mai', spend: 11200 },
          { month: 'Jun', spend: 14800 },
        ],
        tendersByCategory: [
          { name: 'Fournitures', value: 35 },
          { name: 'Services', value: 28 },
          { name: 'Équipements', value: 22 },
          { name: 'Matières', value: 15 },
        ],
        topSuppliers: [
          { rank: 1, name: 'TechCorp TN', tenders: 12, amount: 45600 },
          { rank: 2, name: 'Supply Inc', tenders: 9, amount: 28500 },
          { rank: 3, name: 'Industrial Pro', tenders: 8, amount: 22300 },
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
          <Typography sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
            Analytics - Acheteur
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(i => <Card key={i} sx={{ height: '120px' }}><CardContent /></Card>)}
          </Box>
          <TableSkeleton rows={5} columns={3} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '32px' }}>
          Dashboard Analytics - Acheteur
        </Typography>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Appels Totaux</Typography>
                    <AssignmentIcon sx={{ color: theme.palette.primary.main, fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: theme.palette.primary.main }}>
                    {analytics.kpis.totalTenders}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Offres Actives</Typography>
                    <ShoppingCartIcon sx={{ color: '#2e7d32', fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#2e7d32' }}>
                    {analytics.kpis.activeOffers}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Dépenses Totales</Typography>
                    <PaidIcon sx={{ color: '#f57c00', fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#f57c00' }}>
                    {(analytics.kpis.totalSpent / 1000).toFixed(1)}K TND
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Dépense Moyenne</Typography>
                    <TrendingUpIcon sx={{ color: '#0288d1', fontSize: '24px' }} />
                  </Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#0288d1' }}>
                    {analytics.kpis.avgSpend.toLocaleString()} TND
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                  Dépenses Mensuelles
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
                  Tendance des dépenses sur 6 mois
                </Typography>
                <Box sx={{ textAlign: 'center', color: '#666' }}>
                  Graphique de dépenses mensuelles en TND
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                  Appels par Catégorie
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
                  Distribution des appels par type
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {analytics.tendersByCategory.map((cat, i) => (
                    <Box key={i} sx={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '12px', color: '#666' }}>{cat.name}</Typography>
                      <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{cat.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Suppliers */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
              Top Fournisseurs
            </Typography>
            <Paper sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rang</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fournisseur</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Appels</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.topSuppliers.map((supplier) => (
                    <TableRow key={supplier.rank} hover>
                      <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>#{supplier.rank}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.tenders}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{supplier.amount.toLocaleString()} TND</TableCell>
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
