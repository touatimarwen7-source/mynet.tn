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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { setPageTitle } from '../utils/pageTitle';
import { directSupplyAPI } from '../api';

export default function SupplierRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setPageTitle('الطلبات المستقبلة');
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await directSupplyAPI.getReceivedRequests();
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

  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setDialogAction(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNotes('');
    setSelectedRequest(null);
  };

  const handleUpdateStatus = async () => {
    try {
      await directSupplyAPI.updateRequestStatus(selectedRequest.id, dialogAction);
      setError('');
      // Refresh requests
      fetchRequests();
      handleCloseDialog();
      // Show success message
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('خطأ في تحديث الحالة');
    }
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
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '30px' }}>
          الطلبات المستقبلة
        </Typography>

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
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>اسم المشتري</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>المنتج</TableCell>
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
                    <TableCell sx={{ fontWeight: 500 }}>{request.buyer_company}</TableCell>
                    <TableCell>{request.title}</TableCell>
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
                        sx={{ color: '#0056B3', marginRight: '4px' }}
                      >
                        عرض
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleOpenDialog(request, 'accepted')}
                            sx={{ color: '#4caf50', marginRight: '4px' }}
                          >
                            قبول
                          </Button>
                          <Button
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => handleOpenDialog(request, 'rejected')}
                            sx={{ color: '#f44336' }}
                          >
                            رفض
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogAction === 'accepted' ? 'قبول الطلب' : 'رفض الطلب'}
          </DialogTitle>
          <DialogContent sx={{ paddingY: '20px' }}>
            {selectedRequest && (
              <Box>
                <Typography variant="body2" sx={{ marginBottom: '12px', color: '#666' }}>
                  <strong>المنتج:</strong> {selectedRequest.title}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: '12px', color: '#666' }}>
                  <strong>الميزانية:</strong> {parseFloat(selectedRequest.budget).toFixed(3)} DT
                </Typography>
                <TextField
                  fullWidth
                  label="ملاحظات (اختياري)"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات إضافية..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              sx={{
                backgroundColor: dialogAction === 'accepted' ? '#4caf50' : '#f44336'
              }}
            >
              {dialogAction === 'accepted' ? 'قبول' : 'رفض'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
