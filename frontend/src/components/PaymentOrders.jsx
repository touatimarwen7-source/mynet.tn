import { useState, useEffect } from 'react';
import { Box, Container, Typography, Stack, Card, CardContent, Button, Chip } from '@mui/material';
import { procurementAPI } from '../api';

export default function PaymentOrders() {
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
      console.error('خطأ في تحميل أوامر الصرف:', error);
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
    return new Intl.NumberFormat('ar-TN', { style: 'currency', currency }).format(amount);
  };

  const filteredOrders = orders.filter(order => filter === 'all' || order.status === filter);

  if (loading) {
    return <Box sx={{ padding: '20px', textAlign: 'center' }}>جاري تحميل أوامر الصرف...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, marginBottom: '24px' }}>
        أوامر الصرف
      </Typography>

      <Stack direction="row" spacing={1} sx={{ marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'الكل' },
          { value: 'pending', label: 'قيد الانتظار' },
          { value: 'approved', label: 'موافق عليه' },
          { value: 'in_progress', label: 'قيد الإنجاز' },
          { value: 'completed', label: 'مكتمل' }
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
            <Typography sx={{ color: '#616161' }}>لا توجد أوامر صرف</Typography>
            <Typography sx={{ fontSize: '13px', color: '#9e9e9e' }}>سيظهر هنا عند إنشاء أوامر جديدة</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map(order => (
            <Card key={order.id} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
              <CardContent sx={{ padding: '24px' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ marginBottom: '16px' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                      {order.po_number || 'رقم غير محدد'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>
                      {order.tender_title || 'مناقصة'}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      order.status === 'pending' ? 'قيد الانتظار' :
                      order.status === 'approved' ? 'موافق عليه' :
                      order.status === 'in_progress' ? 'قيد الإنجاز' :
                      order.status === 'completed' ? 'مكتمل' :
                      'ملغى'
                    }
                    sx={{ backgroundColor: getStatusColor(order.status), color: '#FFFFFF' }}
                  />
                </Stack>

                <Stack spacing={1} sx={{ marginBottom: '16px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>المورد:</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#212121' }}>
                      {order.supplier_name || 'غير محدد'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>المبلغ الإجمالي:</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
                      {formatCurrency(order.total_amount, order.currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>شروط الدفع:</Typography>
                    <Typography sx={{ fontSize: '13px', color: '#212121' }}>
                      {order.payment_terms || 'عادية'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', color: '#616161' }}>تاريخ الإنشاء:</Typography>
                    <Typography sx={{ fontSize: '13px', color: '#212121' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-TN')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined">عرض التفاصيل</Button>
                  <Button size="small" variant="outlined">تحديث الحالة</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
