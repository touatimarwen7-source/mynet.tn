import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Box, Container, Typography, Stack, Card, CardContent, Button, Chip } from '@mui/material';
import institutionalTheme from '../theme/theme';
import { procurementAPI } from '../api';
import institutionalTheme from '../theme/theme';

export default function PaymentOrders() {
  const theme = institutionalTheme;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPaymentOrders();
  }, []);

  const fetchPaymentOrders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getPurchaseOrders?.() || { data: { purchaseOrders: [] } };
      setOrders(response.data.purchaseOrders || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#f57c00',
      approved: '#2e7d32',
      in_progress: '#0288d1',
      completed: '#1b5e20',
      cancelled: '#c62828'
    };
    return colorMap[status] || '#616161';
  };

  const formatCurrency = (amount, currency = 'TND') => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency }).format(amount);
  };

  const filteredOrders = orders.filter(order => filter === 'all' || order.status === filter);

  if (loading) {
    return <Box sx={{ padding: '20px', textAlign: 'center' }}>Chargement des ordres de paiement...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, marginBottom: '24px' }}>
        Ordres de Paiement
      </Typography>

      <Stack direction="row" spacing={1} sx={{ marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'Tous' },
          { value: 'pending', label: 'En attente' },
          { value: 'approved', label: 'Approuvé' },
          { value: 'in_progress', label: 'En cours' },
          { value: 'completed', label: 'Complété' }
        ].map(tab => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? 'contained' : 'outlined'}
            onClick={() => setFilter(tab.value)}
            size="small"
          >
            {tab.label}
          </Button>
        ))}
      </Stack>

      {filteredOrders.length === 0 ? (
        <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
          <CardContent sx={{ textAlign: 'center', padding: '48px' }}>
            <Typography sx={{ fontSize: '24px', marginBottom: '12px' }}>📋</Typography>
            <Typography sx={{ color: '#616161' }}>Aucun ordre de paiement</Typography>
            <Typography sx={{ fontSize: '13px', color: '#9e9e9e' }}>Les ordres apparaîtront ici lors de leur création</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map(order => (
            <Card key={order.id} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
              <CardContent sx={{ padding: '24px' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ marginBottom: '16px' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '16px', color: theme.palette.text.primary }}>
                      {order.po_number || 'Numéro non défini'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>
                      {order.tender_title || 'Appel d\'offres'}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      order.status === 'pending' ? 'En attente' :
                      order.status === 'approved' ? 'Approuvé' :
                      order.status === 'in_progress' ? 'En cours' :
                      order.status === 'completed' ? 'Complété' :
                      'Annulé'
                    }
                    sx={{ backgroundColor: getStatusColor(order.status), color: '#FFFFFF' }}
                  />
                </Stack>

                <Stack spacing={1} sx={{ marginBottom: '16px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>Fournisseur:</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: theme.palette.text.primary }}>
                      {order.supplier_name || 'Non défini'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>Montant Total:</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.palette.primary.main }}>
                      {formatCurrency(order.total_amount, order.currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>Conditions de Paiement:</Typography>
                    <Typography sx={{ fontSize: '13px', color: theme.palette.text.primary }}>
                      {order.payment_terms || 'Standard'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>Date de Création:</Typography>
                    <Typography sx={{ fontSize: '13px', color: theme.palette.text.primary }}>
                      {new Date(order.created_at).toLocaleDateString('fr-TN')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined">Afficher les détails</Button>
                  <Button size="small" variant="outlined">Mettre à jour le statut</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
