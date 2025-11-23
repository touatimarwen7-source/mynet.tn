import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Breadcrumbs,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import WarningIcon from '@mui/icons-material/Warning';
import { TableSkeleton } from '../components/Common/SkeletonLoader';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { getScoreTier, formatScore } from '../utils/evaluationCriteria';

export default function TenderAwarding() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    setPageTitle('ترسية المناقصة - إعلان الفائز');
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenderRes = await procurementAPI.getTender(tenderId);
      const offersRes = await procurementAPI.getOffers(tenderId);
      
      const tenderData = tenderRes.data.tender;
      const offersData = offersRes.data.offers || [];
      
      setTender(tenderData);
      setOffers(offersData);
      
      // إذا كان هناك فائز بالفعل، استرجعه
      const winningOffer = offersData.find(o => o.is_winner);
      if (winningOffer) {
        setWinner(winningOffer);
      }
    } catch (err) {
      setError('خطأ في تحميل البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardTender = async () => {
    if (!winner) {
      setError('يجب اختيار عرض الفائز');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await procurementAPI.selectWinner(winner.id, {
        tender_id: tenderId,
        award_date: new Date().toISOString(),
      });
      
      // تحديث البيانات
      setConfirmDialog(false);
      await loadData();
      
      // عرض رسالة النجاح
      Alert.success?.('✅ تم إعلان الفائز بنجاح!');
    } catch (err) {
      setError('خطأ في إعلان الفائز: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <TableSkeleton rows={3} columns={5} />
        </Container>
      </Box>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => 
    (b.evaluation_score || 0) - (a.evaluation_score || 0)
  );

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: '24px' }}>
          <Link 
            component="button"
            onClick={() => navigate('/tenders')}
            sx={{ cursor: 'pointer', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            المناقصات
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/tender/${tenderId}`)}
            sx={{ cursor: 'pointer', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            المناقصة
          </Link>
          <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            إعلان الفائز
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '16px' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/tender/${tenderId}`)}
              sx={{ color: theme.palette.primary.main, textTransform: 'none' }}
            >
              العودة
            </Button>
          </Box>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: theme.palette.primary.main, 
              mb: '8px' 
            }}
          >
            🏆 إعلان الفائز - ترسية المناقصة
          </Typography>
          {tender && (
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
                <strong>ID Référence:</strong> {tender.reference_id}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#666666', mb: '8px' }}>
                {tender.title}
              </Typography>
              {tender.awardLevel && (
                <Typography sx={{ fontSize: '12px', color: '#0056B3', fontWeight: 600 }}>
                  🎯 مستوى الترسية: {
                    tender.awardLevel === 'lot' ? 'بالـ Lot' : 
                    tender.awardLevel === 'article' ? 'بالمادة' : 
                    'عام'
                  }
                </Typography>
              )}
              {tender.lots && tender.lots.length > 0 && (
                <Typography sx={{ fontSize: '12px', color: '#666666', mt: '4px' }}>
                  📦 عدد الـ Lots: {tender.lots.length}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: '24px', backgroundColor: '#FFEBEE', color: '#C62828' }}>
            {error}
          </Alert>
        )}

        {/* Winner Announcement */}
        {winner ? (
          <Stack spacing={3}>
            {/* Winner Card */}
            <Card sx={{ 
              border: '3px solid #4CAF50', 
              backgroundColor: '#E8F5E9',
              borderRadius: '8px'
            }}>
              <CardContent sx={{ padding: '24px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '16px' }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
                  <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#2E7D32' }}>
                    ✅ تم اختيار الفائز
                  </Typography>
                </Box>

                <Paper sx={{ p: '16px', backgroundColor: '#fff', border: '1px solid #4CAF50' }}>
                  <Stack spacing={2}>
                    {/* Supplier Info */}
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                        المورد الفائز
                      </Typography>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                        {winner.supplier_name || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          المبلغ الإجمالي
                        </Typography>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#0056B3' }}>
                          {parseFloat(winner.total_amount || 0).toFixed(2)} {winner.currency || 'TND'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          درجة التقييم
                        </Typography>
                        <Chip 
                          label={`${winner.evaluation_score?.toFixed(1) || 0}/100`}
                          color="success"
                          sx={{ fontSize: '14px', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>

                    {/* Delivery & Payment */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          مدة التسليم
                        </Typography>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                          {winner.delivery_time || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          شروط الدفع
                        </Typography>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                          {winner.payment_terms || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Documents */}
                    {winner.documents && winner.documents.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '8px', fontWeight: 600 }}>
                          📄 المستندات المرفقة
                        </Typography>
                        <Stack spacing={1}>
                          {winner.documents.map((doc, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <DocumentScannerIcon sx={{ fontSize: 18, color: '#0056B3' }} />
                              <Typography sx={{ fontSize: '12px', color: '#0056B3' }}>
                                {doc.name || `المستند ${idx + 1}`}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Lots & Articles */}
                    {tender?.lots && tender.lots.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '8px', fontWeight: 600 }}>
                          📦 Lots و المواد
                        </Typography>
                        <Stack spacing={1}>
                          {tender.lots.map((lot, idx) => (
                            <Box key={idx} sx={{ p: '8px', backgroundColor: '#F5F5F5', borderRadius: '4px', borderLeft: '3px solid #0056B3' }}>
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
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: '24px' }}>
                  <Button
                    variant="contained"
                    startIcon={<VerifiedUserIcon />}
                    onClick={() => setConfirmDialog(true)}
                    disabled={submitting}
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 600,
                      flex: 1,
                      '&:hover': { backgroundColor: '#388E3C' },
                    }}
                  >
                    {submitting ? 'جاري الإعلان...' : '✅ تأكيد الإعلان عن الفائز'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setWinner(null)}
                    disabled={submitting}
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    اختيار آخر
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : (
          /* Choose Winner Section */
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3', mb: '20px' }}>
                🎯 اختر العرض الفائز
              </Typography>

              {sortedOffers.length === 0 ? (
                <Alert severity="info">لم يتم استقبال أي عروض لهذه المناقصة</Alert>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, width: '30%' }}>
                          المورد
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, width: '20%' }}>
                          المبلغ
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, width: '15%' }}>
                          التسليم
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, width: '15%' }}>
                          الدرجة
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, width: '20%' }}>
                          الإجراء
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedOffers.map((offer, idx) => (
                        <TableRow 
                          key={offer.id} 
                          sx={{ 
                            backgroundColor: idx % 2 === 0 ? '#fff' : '#F9F9F9',
                            '&:hover': { backgroundColor: '#E3F2FD' }
                          }}
                        >
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                            {offer.supplier_name || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.primary.main }}>
                            {parseFloat(offer.total_amount || 0).toFixed(2)} TND
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>
                            {offer.delivery_time || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                            <Chip
                              label={`${offer.evaluation_score?.toFixed(1) || 0}/100`}
                              color={offer.evaluation_score >= 70 ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setWinner(offer)}
                              disabled={submitting}
                              sx={{
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#388E3C' },
                              }}
                            >
                              اختر
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Other Offers Summary */}
        {offers.length > 1 && (
          <Card sx={{ border: '1px solid #E0E0E0', mt: '24px' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📋 ملخص بقية العروض
              </Typography>
              <Stack spacing={1}>
                {sortedOffers.map((offer, idx) => (
                  <Box
                    key={offer.id}
                    sx={{
                      p: '12px',
                      backgroundColor: winner?.id === offer.id ? '#E8F5E9' : '#F9F9F9',
                      border: winner?.id === offer.id ? '2px solid #4CAF50' : '1px solid #E0E0E0',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                        #{idx + 1} - {offer.supplier_name || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#666666' }}>
                        {parseFloat(offer.total_amount || 0).toFixed(2)} TND | {offer.delivery_time || 'N/A'}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${offer.evaluation_score?.toFixed(1) || 0}/100`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WarningIcon /> ⚠️ تأكيد الإعلان عن الفائز
        </DialogTitle>
        <DialogContent sx={{ pt: '16px' }}>
          <Alert severity="error" sx={{ mb: '16px' }}>
            ⚠️ هذا الإجراء نهائي ولا يمكن التراجع عنه
          </Alert>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '14px', color: '#212121' }}>
              هل تريد إعلان <strong sx={{ color: '#0056B3' }}>{winner?.supplier_name}</strong> كفائز؟
            </Typography>
            <Paper sx={{ p: '12px', backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32', fontWeight: 600 }}>
                  💰 المبلغ: {parseFloat(winner?.total_amount || 0).toFixed(2)} TND
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32' }}>
                  🚚 التسليم: {winner?.delivery_time || 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32' }}>
                  ⭐ التقييم: {winner?.evaluation_score?.toFixed(1) || 0}/100
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px' }}>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={submitting}
            sx={{ color: theme.palette.primary.main }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleAwardTender}
            disabled={submitting}
            sx={{
              backgroundColor: '#D32F2F',
              '&:hover': { backgroundColor: '#B71C1C' },
              '&:disabled': { backgroundColor: '#BDBDBD' },
            }}
          >
            {submitting ? '⏳ جاري...' : '✓ تأكيد الإعلان'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
