import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { setPageTitle } from '../utils/pageTitle';
import axiosInstance from '../services/axiosConfig';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setPageTitle('أوامر الشراء');
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/procurement/purchase-orders/my-orders', {
        params: { status: filter || undefined }
      });
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des bons de commande');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            أوامر الشراء
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            {['', 'pending', 'confirmed', 'delivered'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'contained' : 'outlined'}
                onClick={() => setFilter(status)}
                sx={{ 
                  backgroundColor: filter === status ? '#0056B3' : 'transparent',
                  color: filter === status ? 'white' : '#0056B3'
                }}
              >
                {status || 'الكل'}
              </Button>
            ))}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Alert severity="info">لا توجد أوامر شراء</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>رقم الطلب</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>المبلغ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>التاريخ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{order.po_number}</TableCell>
                    <TableCell>{order.total_amount?.toFixed(3)} TND</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        تحميل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
