import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Breadcrumbs,
  Link,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TableSkeleton, CardSkeleton } from '../components/SkeletonLoader';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { getScoreTier, formatScore } from '../utils/evaluationCriteria';

export default function OfferAnalysis() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offers, setOffers] = useState([]);
  const [tender, setTender] = useState(null);
  const [analysis, setAnalysis] = useState({
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    totalOffers: 0,
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setPageTitle('تحليل العروض');
    fetchOffers();
  }, [tenderId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');

      // Get tender and offers
      const tenderRes = await procurementAPI.getTender(tenderId);
      const response = await procurementAPI.getOffers(tenderId);
      const offersData = response.data.offers || [];

      setTender(tenderRes.data.tender);
      setOffers(offersData);

      // Calculate analysis
      if (offersData.length > 0) {
        const prices = offersData
          .map((offer) => parseFloat(offer.total_amount) || 0)
          .filter((price) => price > 0);

        if (prices.length > 0) {
          const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
          const minPrice = Math.min(...prices).toFixed(2);
          const maxPrice = Math.max(...prices).toFixed(2);

          setAnalysis({
            avgPrice: parseFloat(avgPrice),
            minPrice: parseFloat(minPrice),
            maxPrice: parseFloat(maxPrice),
            totalOffers: offersData.length,
          });
        } else {
          setAnalysis({
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            totalOffers: offersData.length,
          });
        }
      }
    } catch (err) {
      setError('فشل تحميل تحليل العروض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriceTrend = (price) => {
    if (analysis.avgPrice === 0) return 'stable';
    if (price < analysis.avgPrice * 0.9) return 'down';
    if (price > analysis.avgPrice * 1.1) return 'up';
    return 'stable';
  };

  const exportToJSON = () => {
    const data = {
      tenderId,
      analysis,
      offers,
      exportDate: new Date().toISOString(),
    };
    const element = document.createElement('a');
    element.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    element.download = `offer-analysis-${tenderId}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToCSV = () => {
    let csv = 'رقم المورد,اسم المورد,المبلغ (TND),مدة التسليم,شروط الدفع,حالة التقييم,التاريخ\n';

    offers.forEach((offer) => {
      csv += `${offer.id || 'N/A'},${offer.supplier_name || 'N/A'},${offer.total_amount || 0},${offer.delivery_time || 'N/A'},${offer.payment_terms || 'N/A'},${offer.evaluation_status || 'معلق'},${new Date(offer.created_at).toLocaleDateString('ar-TN')}\n`;
    });

    const element = document.createElement('a');
    element.href = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`;
    element.download = `offer-analysis-${tenderId}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <CardSkeleton />
          <Box sx={{ mt: '24px' }}>
            <TableSkeleton rows={5} columns={5} />
          </Box>
        </Container>
      </Box>
    );
  }

  const analysisCards = [
    {
      title: 'السعر المتوسط',
      value: `${analysis.avgPrice.toLocaleString('ar-TN')} TND`,
      trend: 'neutral',
      icon: 'avg',
    },
    {
      title: 'السعر الأدنى',
      value: `${analysis.minPrice.toLocaleString('ar-TN')} TND`,
      trend: 'down',
      icon: 'min',
    },
    {
      title: 'السعر الأعلى',
      value: `${analysis.maxPrice.toLocaleString('ar-TN')} TND`,
      trend: 'up',
      icon: 'max',
    },
    {
      title: 'عدد العروض',
      value: analysis.totalOffers.toString(),
      trend: 'neutral',
      icon: 'count',
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: '24px' }}>
          <Link 
            component="button"
            onClick={() => navigate('/tenders')}
            sx={{ cursor: 'pointer', color: institutionalTheme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            المناقصات
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/tender/${tenderId}`)}
            sx={{ cursor: 'pointer', color: institutionalTheme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            المناقصة
          </Link>
          <Typography sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 600 }}>
            تحليل العروض
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: '32px',
                fontWeight: 600,
                color: institutionalTheme.palette.primary.main,
                mb: '8px',
              }}
            >
              📊 تحليل العروض
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#666666' }}>
              المناقصة رقم: {tenderId}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              variant="outlined"
              size="small"
              sx={{ color: institutionalTheme.palette.primary.main, borderColor: institutionalTheme.palette.primary.main }}
            >
              تصدير CSV
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={exportToJSON}
              variant="outlined"
              size="small"
              sx={{ color: institutionalTheme.palette.primary.main, borderColor: institutionalTheme.palette.primary.main }}
            >
              تصدير JSON
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: '24px', backgroundColor: '#FFEBEE' }}>
            {error}
          </Alert>
        )}

        {/* Analysis Cards */}
        <Grid container spacing={2} sx={{ mb: '32px' }}>
          {analysisCards.map((item, idx) => (
            <Grid xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  border: '1px solid #E0E0E0',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0, 86, 179, 0.1)' },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  <Typography sx={{ color: '#666666', fontSize: '12px', fontWeight: 600, mb: '8px' }}>
                    {item.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '18px',
                        color: institutionalTheme.palette.primary.main,
                      }}
                    >
                      {item.value}
                    </Typography>
                    {item.trend === 'up' && <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 24 }} />}
                    {item.trend === 'down' && <TrendingDownIcon sx={{ color: '#FF9800', fontSize: 24 }} />}
                    {item.trend === 'neutral' && <CompareArrowsIcon sx={{ color: '#2196F3', fontSize: 24 }} />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Analysis Summary */}
        {offers.length > 0 ? (
          <Stack spacing={3}>
            {/* Price Range Info */}
            <Paper sx={{ p: '20px', backgroundColor: '#E3F2FD', borderLeft: '4px solid #0056B3' }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <InfoIcon sx={{ color: '#0056B3', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
                    📈 ملخص الأسعار
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '13px', color: '#212121' }}>
                  نطاق الأسعار المقترحة يتراوح بين{' '}
                  <strong>{analysis.minPrice.toLocaleString('ar-TN')} TND</strong> و
                  <strong> {analysis.maxPrice.toLocaleString('ar-TN')} TND</strong>
                  ، بمتوسط{' '}
                  <strong>{analysis.avgPrice.toLocaleString('ar-TN')} TND</strong> من قبل{' '}
                  <strong>{analysis.totalOffers} مورد</strong>.
                </Typography>
              </Stack>
            </Paper>

            {/* Offers Table */}
            <Card sx={{ border: '1px solid #E0E0E0' }}>
              <CardHeader
                title="📋 قائمة العروض المفصلة"
                action={
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={exportToJSON}
                      sx={{
                        color: institutionalTheme.palette.primary.main,
                        textTransform: 'none',
                        fontSize: '12px',
                      }}
                    >
                      JSON
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={exportToCSV}
                      sx={{
                        color: institutionalTheme.palette.primary.main,
                        textTransform: 'none',
                        fontSize: '12px',
                      }}
                    >
                      CSV
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px' }}>
                          المورد
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          المبلغ (TND)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          مقارنة
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          التسليم
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          الدفع
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          الحالة
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, fontSize: '12px', textAlign: 'center' }}>
                          الإجراء
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {offers.map((offer, idx) => {
                        const trend = getPriceTrend(offer.total_amount);
                        return (
                          <TableRow
                            key={offer.id || idx}
                            sx={{
                              backgroundColor: idx % 2 === 0 ? '#fff' : '#F9F9F9',
                              '&:hover': { backgroundColor: '#E3F2FD' },
                            }}
                          >
                            <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>
                              {offer.supplier_name || 'غير محدد'}
                              <br />
                              <span style={{ fontSize: '11px', color: '#666666', fontWeight: 'normal' }}>
                                {offer.supplier_email || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3', textAlign: 'center' }}>
                              {typeof offer.total_amount === 'number'
                                ? offer.total_amount.toLocaleString('ar-TN')
                                : '0'}{' '}
                              TND
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              {trend === 'down' && (
                                <Chip
                                  label="أقل من المتوسط"
                                  size="small"
                                  icon={<TrendingDownIcon />}
                                  sx={{
                                    backgroundColor: '#E8F5E9',
                                    color: '#2E7D32',
                                    fontSize: '11px',
                                  }}
                                />
                              )}
                              {trend === 'up' && (
                                <Chip
                                  label="أعلى من المتوسط"
                                  size="small"
                                  icon={<TrendingUpIcon />}
                                  sx={{
                                    backgroundColor: '#FFF3E0',
                                    color: '#E65100',
                                    fontSize: '11px',
                                  }}
                                />
                              )}
                              {trend === 'stable' && (
                                <Chip
                                  label="قريب من المتوسط"
                                  size="small"
                                  icon={<CompareArrowsIcon />}
                                  sx={{
                                    backgroundColor: '#E3F2FD',
                                    color: '#0056B3',
                                    fontSize: '11px',
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                              {offer.delivery_time || 'غير محدد'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                              {offer.payment_terms || 'غير محدد'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                              {offer.evaluation_status === 'accepted' && (
                                <Chip label="مقبول" size="small" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} />
                              )}
                              {offer.evaluation_status === 'rejected' && (
                                <Chip label="مرفوض" size="small" sx={{ backgroundColor: '#FFEBEE', color: '#C62828' }} />
                              )}
                              {(!offer.evaluation_status || offer.evaluation_status === 'pending') && (
                                <Chip label="معلق" size="small" sx={{ backgroundColor: '#FFF3E0', color: '#E65100' }} />
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setDetailsOpen(true);
                                }}
                                sx={{
                                  color: institutionalTheme.palette.primary.main,
                                  textTransform: 'none',
                                  fontSize: '11px',
                                }}
                              >
                                التفاصيل
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>

            {/* Statistics Summary */}
            <Paper sx={{ p: '20px', backgroundColor: '#F5F5F5' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '12px' }}>
                📊 إحصائيات مفيدة
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: '#666666', mb: '4px' }}>
                      الفرق السعري
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
                      {(analysis.maxPrice - analysis.minPrice).toLocaleString('ar-TN')} TND
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: '#666666', mb: '4px' }}>
                      نسبة الفرق %
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
                      {analysis.minPrice > 0
                        ? (((analysis.maxPrice - analysis.minPrice) / analysis.minPrice) * 100).toFixed(2)
                        : '0'}
                      %
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: '#666666', mb: '4px' }}>
                      أعلى من المتوسط
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#FF9800' }}>
                      {offers.filter((o) => o.total_amount > analysis.avgPrice * 1.1).length} عرض
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: '#666666', mb: '4px' }}>
                      أقل من المتوسط
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#4CAF50' }}>
                      {offers.filter((o) => o.total_amount < analysis.avgPrice * 0.9).length} عرض
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        ) : (
          <Alert severity="info">لا توجد عروض لهذه المناقصة حتى الآن</Alert>
        )}
      </Container>

      {/* Offer Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600, color: institutionalTheme.palette.primary.main }}>
          تفاصيل العرض
        </DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Stack spacing={2} sx={{ pt: '16px' }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  المورد
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.supplier_name}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  البريد الإلكتروني
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.supplier_email}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  رقم الهاتف
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.supplier_phone || 'غير محدد'}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  المبلغ الإجمالي
                </Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                  {selectedOffer.total_amount?.toLocaleString('ar-TN') || '0'} TND
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  مدة التسليم
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.delivery_time}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  شروط الدفع
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.payment_terms}
                </Typography>
              </Box>
              {selectedOffer.quality_notes && (
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                    ملاحظات الجودة
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#666666' }}>
                    {selectedOffer.quality_notes}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#666666', fontWeight: 600, mb: '4px' }}>
                  تاريخ التقديم
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#212121' }}>
                  {selectedOffer.created_at
                    ? new Date(selectedOffer.created_at).toLocaleDateString('ar-TN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'غير محدد'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
