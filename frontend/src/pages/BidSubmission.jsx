import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function BidSubmission() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Form Data
  const [bidData, setBidData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    delivery_time: '',
    payment_terms: '',
    quality_notes: '',
    line_items: [], // Array of {article_id, quantity, unit_price}
  });

  useEffect(() => {
    setPageTitle('Soumission d\'Offre');
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      setLoading(true);
      const res = await procurementAPI.getTender(tenderId);
      const tenderData = res.data.tender;
      setTender(tenderData);

      // Initialize line items from lots/articles
      if (tenderData.lots && tenderData.lots.length > 0) {
        const items = [];
        tenderData.lots.forEach((lot) => {
          if (lot.articles && lot.articles.length > 0) {
            lot.articles.forEach((article) => {
              items.push({
                lot_id: lot.numero,
                lot_objet: lot.objet,
                article_id: article.id || `${lot.numero}-${article.name}`,
                article_name: article.name,
                quantity: article.quantity,
                unit: article.unit,
                unit_price: '',
              });
            });
          }
        });
        setBidData((prev) => ({ ...prev, line_items: items }));
      }
    } catch (err) {
      setError('خطأ في تحميل المناقصة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (index, value) => {
    const updatedItems = [...bidData.line_items];
    updatedItems[index].unit_price = parseFloat(value) || '';
    setBidData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const calculateItemTotal = (index) => {
    const item = bidData.line_items[index];
    if (item.unit_price && item.quantity) {
      return (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2);
    }
    return '0.00';
  };

  const calculateTotalAmount = () => {
    return bidData.line_items
      .reduce((sum, item) => {
        const total = item.unit_price && item.quantity ? parseFloat(item.unit_price) * parseFloat(item.quantity) : 0;
        return sum + total;
      }, 0)
      .toFixed(2);
  };

  const validateForm = () => {
    if (!bidData.supplier_name.trim()) {
      setError('يجب إدخال اسم المورد');
      return false;
    }
    if (!bidData.supplier_email.trim()) {
      setError('يجب إدخال البريد الإلكتروني');
      return false;
    }
    if (!bidData.supplier_phone.trim()) {
      setError('يجب إدخال رقم الهاتف');
      return false;
    }
    if (!bidData.delivery_time.trim()) {
      setError('يجب إدخال مدة التسليم');
      return false;
    }
    if (!bidData.payment_terms.trim()) {
      setError('يجب إدخال شروط الدفع');
      return false;
    }

    // Check if all prices are filled
    const allPricesFilled = bidData.line_items.every((item) => item.unit_price && item.unit_price > 0);
    if (!allPricesFilled) {
      setError('يجب إدخال أسعار صحيحة لجميع المقالات');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await procurementAPI.createOffer({
        tender_id: tenderId,
        supplier_name: bidData.supplier_name,
        supplier_email: bidData.supplier_email,
        supplier_phone: bidData.supplier_phone,
        total_amount: calculateTotalAmount(),
        currency: 'TND',
        delivery_time: bidData.delivery_time,
        payment_terms: bidData.payment_terms,
        quality_notes: bidData.quality_notes,
        line_items: bidData.line_items,
      });

      setConfirmDialog(false);
      navigate('/my-offers', {
        state: { message: '✅ تم تقديم العرض بنجاح!' },
      });
    } catch (err) {
      setError('خطأ في تقديم العرض: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = () => {
    setBidData({
      supplier_name: '',
      supplier_email: '',
      supplier_phone: '',
      delivery_time: '',
      payment_terms: '',
      quality_notes: '',
      line_items: bidData.line_items,
    });
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: institutionalTheme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/tender/${tenderId}`)}
            sx={{ color: institutionalTheme.palette.primary.main, textTransform: 'none', mb: '16px' }}
          >
            العودة
          </Button>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: institutionalTheme.palette.primary.main,
              mb: '8px'
            }}
          >
            📝 تقديم عرض
          </Typography>
          {tender && (
            <Box>
              <Typography sx={{ fontSize: '14px', color: '#0056B3', mb: '8px', fontWeight: 700 }}>
                🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#666666' }}>
                {tender.title}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: '24px', backgroundColor: '#FFEBEE' }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Tender Summary */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📊 ملخص المناقصة
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      الفئة
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.category || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      الموعد النهائي
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.deadline ? new Date(tender.deadline).toLocaleDateString('ar-TN') : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      عدد الـ Lots
                    </Typography>
                    <Chip 
                      label={`${tender?.lots?.length || 0} Lot`}
                      size="small"
                      sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lots & Articles */}
          {bidData.line_items.length > 0 && (
            <Card sx={{ border: '1px solid #E0E0E0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                  📦 الـ Lots والمقالات
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px' }}>
                          Lot
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px' }}>
                          المقالة
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          الكمية
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          الوحدة
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          سعر الوحدة (TND)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          المجموع (TND)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bidData.line_items.map((item, idx) => (
                        <TableRow 
                          key={idx} 
                          sx={{ 
                            backgroundColor: idx % 2 === 0 ? '#fff' : '#F9F9F9',
                            '&:hover': { backgroundColor: '#E3F2FD' }
                          }}
                        >
                          <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>
                            Lot {item.lot_id}
                            <br />
                            <span style={{ color: '#666666', fontSize: '11px', fontWeight: 'normal' }}>
                              {item.lot_objet}
                            </span>
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>
                            {item.article_name}
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                            {item.unit}
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                            <TextField
                              type="number"
                              size="small"
                              value={item.unit_price}
                              onChange={(e) => handlePriceChange(idx, e.target.value)}
                              disabled={submitting}
                              inputProps={{ step: '0.01', min: '0' }}
                              sx={{ width: '100px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3', textAlign: 'center' }}>
                            {calculateItemTotal(idx)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Row */}
                      <TableRow sx={{ backgroundColor: '#E3F2FD', borderTop: '2px solid #0056B3' }}>
                        <TableCell colSpan={5} sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'right', fontSize: '14px' }}>
                          المجموع الإجمالي:
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'center', fontSize: '14px' }}>
                          {calculateTotalAmount()} TND
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Supplier Information */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                👤 معلومات المورد
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="اسم المورد/الشركة *"
                  name="supplier_name"
                  value={bidData.supplier_name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  variant="outlined"
                  size="small"
                  required
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
                    label="البريد الإلكتروني *"
                    name="supplier_email"
                    type="email"
                    value={bidData.supplier_email}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    required
                  />
                  <TextField
                    label="رقم الهاتف *"
                    name="supplier_phone"
                    value={bidData.supplier_phone}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Delivery & Payment */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                🚚 التسليم والدفع
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="مدة التسليم (مثال: 15 يوم) *"
                    name="delivery_time"
                    value={bidData.delivery_time}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    required
                  />
                  <TextField
                    fullWidth
                    label="شروط الدفع (مثال: 50% مقدم) *"
                    name="payment_terms"
                    value={bidData.payment_terms}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    required
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Quality Notes */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📝 ملاحظات
              </Typography>
              <TextField
                fullWidth
                label="ملاحظات عن الجودة والامتثال"
                name="quality_notes"
                value={bidData.quality_notes}
                onChange={handleInputChange}
                disabled={submitting}
                variant="outlined"
                multiline
                rows={3}
                placeholder="وصف معايير الجودة والضمانات..."
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setConfirmDialog(true)}
              disabled={submitting}
              sx={{
                backgroundColor: '#0056B3',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
                minHeight: '44px',
                '&:hover': { backgroundColor: '#003D82' },
              }}
            >
              {submitting ? 'جاري التقديم...' : '✅ تقديم العرض'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate(`/tender/${tenderId}`)}
              disabled={submitting}
              sx={{
                color: institutionalTheme.palette.primary.main,
                borderColor: institutionalTheme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
                minHeight: '44px',
              }}
            >
              إلغاء
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#0056B3' }}>
          ✅ تأكيد تقديم العرض
        </DialogTitle>
        <DialogContent sx={{ pt: '16px' }}>
          <Typography sx={{ fontSize: '14px', color: '#212121', mb: '12px' }}>
            هل تريد تأكيد تقديم هذا العرض؟
          </Typography>
          <Paper sx={{ p: '12px', backgroundColor: '#F9F9F9' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>المورد:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.supplier_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>المبلغ الإجمالي:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                  {calculateTotalAmount()} TND
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>التسليم:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.delivery_time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>عدد المقالات:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.line_items.length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              backgroundColor: '#0056B3',
              '&:hover': { backgroundColor: '#003D82' },
            }}
          >
            {submitting ? 'جاري...' : 'تأكيد'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
