import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function SubmitBid() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();

  // States
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
    total_amount: '',
    currency: 'TND',
    delivery_time: '',
    payment_terms: '',
    quality_notes: '',
    compliance_notes: '',
    documents: [],
  });

  // Drag & Drop
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setPageTitle('تقديم عرض بديل');
    loadTender();
  }, [tenderId]);

  const loadTender = async () => {
    try {
      setLoading(true);
      const res = await procurementAPI.getTender(tenderId);
      setTender(res.data.tender);
    } catch (err) {
      setError('خطأ في تحميل المناقصة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files || []);
    setBidData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (index) => {
    setBidData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
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
    if (!bidData.total_amount || parseFloat(bidData.total_amount) <= 0) {
      setError('يجب إدخال مبلغ صحيح (أكبر من 0)');
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
        total_amount: parseFloat(bidData.total_amount),
        currency: bidData.currency,
        delivery_time: bidData.delivery_time,
        payment_terms: bidData.payment_terms,
        quality_notes: bidData.quality_notes,
        compliance_notes: bidData.compliance_notes,
        documents: bidData.documents,
      });

      setConfirmDialog(false);
      navigate('/my-offers', { 
        state: { message: '✅ تم تقديم العرض بنجاح!' } 
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
      total_amount: '',
      currency: 'TND',
      delivery_time: '',
      payment_terms: '',
      quality_notes: '',
      compliance_notes: '',
      documents: [],
    });
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
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
            sx={{ color: theme.palette.primary.main, textTransform: 'none', mb: '16px' }}
          >
            العودة
          </Button>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: theme.palette.primary.main,
              mb: '8px'
            }}
          >
            📝 تقديم عرض بديل
          </Typography>
          {tender && (
            <Box>
              <Typography sx={{ fontSize: '14px', color: '#0056B3', mb: '8px', fontWeight: 700 }}>
                🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#666666', mb: '8px' }}>
                {tender.title}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999999' }}>
                هذا عرض بديل سريع. استخدم <strong>"عرض متقدم"</strong> للحصول على خيارات إضافية
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
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      الفئة
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.category || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      الموعد النهائي
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.deadline ? new Date(tender.deadline).toLocaleDateString('ar-TN') : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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

              {/* Lots Display */}
              {tender?.lots && tender.lots.length > 0 && (
                <Box sx={{ mt: '20px', pt: '20px', borderTop: '1px solid #E0E0E0' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3', mb: '12px' }}>
                    📦 الـ Lots والمواد
                  </Typography>
                  <Stack spacing={1}>
                    {tender.lots.map((lot, idx) => (
                      <Paper key={idx} sx={{ p: '12px', backgroundColor: '#F9F9F9', borderLeft: '3px solid #0056B3' }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121', mb: '4px' }}>
                          Lot {lot.numero}: {lot.objet}
                        </Typography>
                        {lot.articles && lot.articles.length > 0 && (
                          <Stack spacing={0.5}>
                            {lot.articles.map((article, aIdx) => (
                              <Typography key={aIdx} sx={{ fontSize: '11px', color: '#666666', ml: '8px' }}>
                                └─ {article.name}: {article.quantity} {article.unit}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

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

          {/* Bid Details */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                💰 تفاصيل العرض
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="المبلغ الإجمالي (TND) *"
                    name="total_amount"
                    type="number"
                    value={bidData.total_amount}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: '0', step: '0.01' }}
                    required
                  />
                  <TextField
                    label="العملة *"
                    name="currency"
                    value={bidData.currency}
                    onChange={handleInputChange}
                    disabled={submitting}
                    variant="outlined"
                    size="small"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    required
                  >
                    <option value="TND">TND</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </TextField>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
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

          {/* Notes */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📝 ملاحظات إضافية
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="ملاحظات عن الجودة"
                  name="quality_notes"
                  value={bidData.quality_notes}
                  onChange={handleInputChange}
                  disabled={submitting}
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="وصف معايير الجودة والضمانات المقدمة..."
                />
                <TextField
                  fullWidth
                  label="ملاحظات عن الامتثال والشروط"
                  name="compliance_notes"
                  value={bidData.compliance_notes}
                  onChange={handleInputChange}
                  disabled={submitting}
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="توافقك مع المتطلبات والشروط..."
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📄 الوثائق المرفقة
              </Typography>
              
              {/* Drag & Drop */}
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                sx={{
                  border: '2px dashed #0056B3',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#E3F2FD' : '#F9F9F9',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  mb: '16px',
                }}
              >
                <AttachFileIcon sx={{ fontSize: 32, color: '#0056B3', mb: 1 }} />
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: '4px' }}>
                  اسحب الملفات هنا أو انقر للاختيار
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999999' }}>
                  PDF، DOC، DOCX، JPG، PNG (الحد الأقصى 5MB)
                </Typography>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={submitting}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <Button
                    component="span"
                    variant="contained"
                    sx={{
                      backgroundColor: '#0056B3',
                      color: '#fff',
                      marginTop: '12px',
                      textTransform: 'none',
                    }}
                    disabled={submitting}
                  >
                    ➕ اختر الملفات
                  </Button>
                </label>
              </Box>

              {/* Files List */}
              {bidData.documents.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121', mb: '8px' }}>
                    الملفات المرفوعة ({bidData.documents.length})
                  </Typography>
                  <Stack spacing={1}>
                    {bidData.documents.map((doc, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#F9F9F9',
                          borderLeft: '4px solid #0056B3',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <AttachFileIcon sx={{ color: '#0056B3', fontSize: 18 }} />
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>
                              {doc.name}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#999999' }}>
                              {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : 'حجم غير معروف'}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(idx)}
                          disabled={submitting}
                        >
                          <DeleteIcon sx={{ fontSize: '18px', color: '#d32f2f' }} />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
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
              startIcon={<ClearIcon />}
              onClick={clearForm}
              disabled={submitting}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
                minHeight: '44px',
              }}
            >
              مسح النموذج
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
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>المبلغ:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                  {parseFloat(bidData.total_amount || 0).toFixed(2)} {bidData.currency}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>التسليم:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.delivery_time}
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
