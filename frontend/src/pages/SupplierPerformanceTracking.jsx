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
  LinearProgress,
  Chip,
} from '@mui/material';
import { TableSkeleton } from '../components/SkeletonLoader';

export default function SupplierPerformanceTracking() {
  const theme = institutionalTheme;
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      const mockSuppliers = [
        {
          id: 1,
          name: 'TechCorp TN',
          rating: 4.8,
          reviews: 28,
          deliveryScore: 95,
          qualityScore: 92,
          responseScore: 98,
          rank: 1,
          status: 'premium',
          completedOrders: 156,
          onTimeDelivery: 94,
        },
        {
          id: 2,
          name: 'Supply Inc',
          rating: 4.5,
          reviews: 19,
          deliveryScore: 87,
          qualityScore: 88,
          responseScore: 91,
          rank: 2,
          status: 'verified',
          completedOrders: 98,
          onTimeDelivery: 86,
        },
        {
          id: 3,
          name: 'Industrial Pro',
          rating: 4.2,
          reviews: 15,
          deliveryScore: 82,
          qualityScore: 85,
          responseScore: 88,
          rank: 3,
          status: 'verified',
          completedOrders: 67,
          onTimeDelivery: 81,
        },
        {
          id: 4,
          name: 'Distribution Services',
          rating: 3.9,
          reviews: 12,
          deliveryScore: 78,
          qualityScore: 80,
          responseScore: 85,
          rank: 4,
          status: 'standard',
          completedOrders: 45,
          onTimeDelivery: 76,
        },
      ];
      setSuppliers(mockSuppliers);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Typography sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
            Suivi de Performance des Fournisseurs
          </Typography>
          <TableSkeleton rows={5} columns={6} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '32px' }}>
          Suivi de Performance des Fournisseurs
        </Typography>

        {/* Supplier Cards */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          {suppliers.map((supplier) => (
            <Grid item xs={12} md={6} key={supplier.id}>
              <Card sx={{ border: '1px solid #e0e0e0', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '18px' }}>
                        #{supplier.rank} - {supplier.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <Rating value={supplier.rating} readOnly size="small" />
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                          {supplier.rating} ({supplier.reviews} avis)
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={supplier.status === 'premium' ? 'Premium' : 'Vérifié'}
                      color={supplier.status === 'premium' ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Livraison</Typography>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{supplier.deliveryScore}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={supplier.deliveryScore} sx={{ height: '6px', borderRadius: '3px' }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Qualité</Typography>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{supplier.qualityScore}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={supplier.qualityScore} sx={{ height: '6px', borderRadius: '3px' }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>Réactivité</Typography>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{supplier.responseScore}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={supplier.responseScore} sx={{ height: '6px', borderRadius: '3px' }} />
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
                    <Box sx={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '12px', color: '#666' }}>Commandes</Typography>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{supplier.completedOrders}</Typography>
                    </Box>
                    <Box sx={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '12px', color: '#666' }}>À l'heure</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>{supplier.onTimeDelivery}%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Performance Ranking Table */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
              Classement Détaillé
            </Typography>
            <Paper sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rang</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fournisseur</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Livraison</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Qualité</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>À l'heure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id} hover>
                      <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>#{supplier.rank}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{supplier.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Rating value={supplier.rating} readOnly size="small" />
                          <Typography sx={{ fontSize: '12px' }}>{supplier.rating}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box sx={{ flex: 1, height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${supplier.deliveryScore}%`, backgroundColor: '#2e7d32', borderRadius: '2px' }} />
                          </Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, width: '30px' }}>{supplier.deliveryScore}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box sx={{ flex: 1, height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${supplier.qualityScore}%`, backgroundColor: theme.palette.primary.main, borderRadius: '2px' }} />
                          </Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, width: '30px' }}>{supplier.qualityScore}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box sx={{ flex: 1, height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${supplier.onTimeDelivery}%`, backgroundColor: '#f57c00', borderRadius: '2px' }} />
                          </Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, width: '30px' }}>{supplier.onTimeDelivery}%</Typography>
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
