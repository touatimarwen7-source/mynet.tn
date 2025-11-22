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
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Paper,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import { directSupplyAPI } from '../api';

export default function MySupplyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    setPageTitle('طلبات الشراء المباشر');
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await directSupplyAPI.getMyRequests();
      setRequests(data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      completed: 'منتهي',
    };
    return labels[status] || status;
  };

  const filteredRequests = filterStatus
    ? requests.filter(r => r.status === filterStatus)
    : requests;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#0056B3' }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3' }}>
            طلبات الشراء المباشر
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/direct-supply-request')}
            sx={{ backgroundColor: '#0056B3' }}
          >
            طلب جديد
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="حالة الطلب"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">جميع الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="accepted">مقبول</option>
                  <option value="rejected">مرفوض</option>
                  <option value="completed">منتهي</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  إجمالي الطلبات: {filteredRequests.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {filteredRequests.length === 0 ? (
          <Alert severity="info">لا توجد طلبات حالياً</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#0056B3' }}>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>المنتج</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>الفئة</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>الكمية</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>الميزانية (DT)</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>الحالة</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>التاريخ</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{request.title}</TableCell>
                    <TableCell>{request.category}</TableCell>
                    <TableCell>{request.quantity} {request.unit}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0056B3' }}>
                      {parseFloat(request.budget).toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString('ar-TN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{ color: '#0056B3', marginRight: '8px' }}
                      >
                        عرض
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
