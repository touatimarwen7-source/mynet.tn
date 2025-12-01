import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert, CircularProgress, Paper, Grid } from '@mui/material';
import axios from '../api/axiosConfig';
import { theme } from '../theme/theme';

export default function TenderManagement({ tenderId }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [awardedQuantities, setAwardedQuantities] = useState({}); // ✅ حالة جديدة لتخزين الكميات المترسية
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, [tenderId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tender-management/award-status/${tenderId}`);
      const offersData = response.data.status || [];
      setOffers(offersData);

      // ✅ تهيئة الكميات المترسية بالكميات الكاملة افتراضيًا
      const initialQuantities = {};
      offersData.forEach(offer => {
        (offer.lineItems || []).forEach(item => {
          initialQuantities[`${offer.id}-${item.id}`] = item.quantity;
        });
      });
      setAwardedQuantities(initialQuantities);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = (offerId) => {
    setSelectedWinners(prev =>
      prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]
    );
  };

  // ✅ دالة جديدة لتحديث الكميات المترسية
  const handleQuantityChange = (offerId, itemId, value) => {
    const originalItem = offers.find(o => o.id === offerId)?.lineItems?.find(i => i.id === itemId);
    const maxQuantity = originalItem?.quantity || 0;
    const newQuantity = Math.max(0, Math.min(maxQuantity, Number(value)));

    setAwardedQuantities(prev => ({
      ...prev,
      [`${offerId}-${itemId}`]: newQuantity,
    }));
  };

  const handleAwardWinners = async () => {
    if (selectedWinners.length === 0) {
      setError('يرجى اختيار فائز واحد على الأقل');
      return;
    }

    // ✅ بناء بنية البيانات الجديدة للترسية الجزئية
    const payload = {
      awards: selectedWinners.map(winnerId => ({
        supplierId: offers.find(o => o.id === winnerId)?.supplierId,
        lineItems: offers.find(o => o.id === winnerId)?.lineItems
          ?.map(item => ({
            id: item.id,
            awardedQuantity: awardedQuantities[`${winnerId}-${item.id}`] || 0,
          })).filter(item => item.awardedQuantity > 0) || [],
      })),
    };

    try {
      setLoading(true);
      await axios.post(`/api/tender-management/award-winners/${tenderId}`, payload);
      setError(null);
      setSelectedWinners([]);
      setAwardDialogOpen(false);
      fetchOffers();
    } catch (err) {
      setError('فشل في تحديد الفائزين');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTender = async () => {
    if (!cancellationReason.trim()) {
      setError('يرجى إدخال سبب الإلغاء');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`/api/tender-management/cancel/${tenderId}`, { cancellationReason });
      setError(null);
      setCancellationReason('');
      setCancelDialogOpen(false);
    } catch (err) {
      setError('فشل في إلغاء المناقصة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
        📋 إدارة المناقصة
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              🏆 اختيار الفائزين
            </Typography>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>اختيار</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>رقم العرض</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>الشركة</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>النتيجة النهائية</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map(offer => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <Checkbox checked={selectedWinners.includes(offer.id)} onChange={() => handleSelectWinner(offer.id)} />
                    </TableCell>
                    <TableCell>{offer.offer_number}</TableCell>
                    <TableCell>{offer.company_name}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{offer.final_score}</TableCell>
                    <TableCell>
                      {offer.award_status === 'awarded' ? (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ فائز</span>
                      ) : (
                        'قيد الانتظار'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => setAwardDialogOpen(true)} sx={{ backgroundColor: theme.palette.primary.main }}>
                تأكيد اختيار الفائزين
              </Button>
              <Button variant="outlined" onClick={() => setCancelDialogOpen(true)} sx={{ color: '#f44336', borderColor: '#f44336' }}>
                ⚠️ إلغاء المناقصة
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      <Dialog open={awardDialogOpen} onClose={() => setAwardDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>تأكيد الترسية وتحديد الكميات</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            يمكنك تعديل الكميات لكل بند. إذا تركت الكمية كما هي، فسيتم ترسية البند بالكامل.
          </Alert>
          {selectedWinners.map(winnerId => {
            const offer = offers.find(o => o.id === winnerId);
            return (
              <Paper key={winnerId} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{offer.company_name}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>البند</TableCell>
                      <TableCell align="right">الكمية الأصلية</TableCell>
                      <TableCell align="right">الكمية المترسية</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(offer.lineItems || []).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={awardedQuantities[`${winnerId}-${item.id}`] || ''}
                            onChange={(e) => handleQuantityChange(winnerId, item.id, e.target.value)}
                            inputProps={{ min: 0, max: item.quantity, style: { textAlign: 'right' } }}
                            sx={{ width: '80px' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAwardDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleAwardWinners} variant="contained" sx={{ backgroundColor: theme.palette.primary.main }}>
            تأكيد
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إلغاء المناقصة</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ هذا الإجراء سيلغي المناقصة وسيتم إرسال إخطارات الإلغاء لجميع المزودين
          </Alert>
          <TextField fullWidth label="سبب الإلغاء" value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} multiline rows={4} placeholder="أدخل سبب الإلغاء (إلزامي)" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>إغلاق</Button>
          <Button onClick={handleCancelTender} variant="contained" sx={{ backgroundColor: '#f44336' }}>
            إلغاء المناقصة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
