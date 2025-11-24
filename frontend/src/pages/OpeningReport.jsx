import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Container, Box, Card, CardContent, Typography, Button, Table,
  TableHead, TableBody, TableRow, TableCell, CircularProgress,
  Alert, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

// Constants for Opening Report styling
const OPENING_REPORT_CONSTANTS = {
  COLORS: {
    PRIMARY: institutionalTheme.palette.primary.main,
    SUCCESS: '#4caf50',
    ERROR: '#d32f2f',
    BACKGROUND_LIGHT: '#F5F5F5',
    BORDER: '#E0E0E0',
    TEXT_SECONDARY: '#666666',
    TEXT_MUTED: '#999999'
  },
  SPACING: {
    LARGE: 40,
    MEDIUM: 24,
    SMALL: 16,
    TINY: 8
  },
  BORDER_RADIUS: 4,
  MIN_HEIGHT_FULL: '100vh'
};

export default function OpeningReport() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportDialog, setExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setPageTitle('محضر الفتح');
    loadOpeningReport();
  }, [tenderId]);

  const loadOpeningReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await procurementAPI.get(`/opening-reports/tenders/${tenderId}/opening-report`);
      
      if (!res.data.success || !res.data.report) {
        setError('لم يتم العثور على محضر الفتح');
        return;
      }
      
      setReport(res.data.report);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'خطأ في تحميل البيانات';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const res = await procurementAPI.get(`/opening-reports/${report.id}/export?format=${format}`);
      
      if (res.data.success) {
        const dataStr = JSON.stringify(res.data.report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `محضر-الفتح-${tenderId}-${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        setExportDialog(false);
      }
    } catch (err) {
      setError('خطأ في تنزيل الملف: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: OPENING_REPORT_CONSTANTS.MIN_HEIGHT_FULL 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: `${OPENING_REPORT_CONSTANTS.SPACING.LARGE}px` }}>
        <Alert severity="error" onClose={() => navigate(-1)}>
          {error || 'خطأ: لم يتم العثور على محضر الفتح'}
        </Alert>
      </Container>
    );
  }

  const offersData = Array.isArray(report.offers_data) 
    ? report.offers_data 
    : (typeof report.offers_data === 'string' 
      ? JSON.parse(report.offers_data) 
      : []);

  return (
    <Box sx={{ 
      backgroundColor: OPENING_REPORT_CONSTANTS.COLORS.BACKGROUND_LIGHT, 
      paddingY: `${OPENING_REPORT_CONSTANTS.SPACING.LARGE}px`, 
      minHeight: OPENING_REPORT_CONSTANTS.MIN_HEIGHT_FULL,
      direction: 'rtl'
    }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: `${OPENING_REPORT_CONSTANTS.SPACING.SMALL}px` }}
        >
          رجوع
        </Button>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
            {error}
          </Alert>
        )}

        {/* Header Card */}
        <Card sx={{ 
          border: `1px solid ${OPENING_REPORT_CONSTANTS.COLORS.BORDER}`, 
          borderRadius: `${OPENING_REPORT_CONSTANTS.BORDER_RADIUS}px`, 
          mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` 
        }}>
          <CardContent sx={{ padding: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
            <Typography 
              variant="h4" 
              sx={{ color: OPENING_REPORT_CONSTANTS.COLORS.PRIMARY, mb: `${OPENING_REPORT_CONSTANTS.SPACING.TINY}px` }}
            >
              📋 محضر الفتح
            </Typography>
            <Typography sx={{ fontSize: '14px', color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_SECONDARY }}>
              تقرير رسمي بتفاصيل جميع العروض المستلمة
            </Typography>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card sx={{ 
          border: `1px solid ${OPENING_REPORT_CONSTANTS.COLORS.BORDER}`, 
          borderRadius: `${OPENING_REPORT_CONSTANTS.BORDER_RADIUS}px`, 
          mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` 
        }}>
          <CardContent sx={{ padding: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${OPENING_REPORT_CONSTANTS.SPACING.SMALL}px`, mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_MUTED }}>
                  رقم المناقصة
                </Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                  #{report.tender_number || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_MUTED }}>
                  وقت الفتح
                </Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                  {new Date(report.opened_at).toLocaleString('ar-TN')}
                </Typography>
              </Box>
            </Box>

            {/* Statistics */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: `${OPENING_REPORT_CONSTANTS.SPACING.SMALL}px`, 
              p: `${OPENING_REPORT_CONSTANTS.SPACING.SMALL}px`, 
              backgroundColor: OPENING_REPORT_CONSTANTS.COLORS.BACKGROUND_LIGHT, 
              borderRadius: `${OPENING_REPORT_CONSTANTS.BORDER_RADIUS}px` 
            }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_SECONDARY }}>
                  العروض الكلية
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: OPENING_REPORT_CONSTANTS.COLORS.PRIMARY }}>
                  {report.total_offers_received || 0}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_SECONDARY }}>
                  الصالحة
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: OPENING_REPORT_CONSTANTS.COLORS.SUCCESS }}>
                  {report.total_valid_offers || 0}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', color: OPENING_REPORT_CONSTANTS.COLORS.TEXT_SECONDARY }}>
                  غير الصالحة
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: OPENING_REPORT_CONSTANTS.COLORS.ERROR }}>
                  {report.total_invalid_offers || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Offers Table Card */}
        <Card sx={{ 
          border: `1px solid ${OPENING_REPORT_CONSTANTS.COLORS.BORDER}`, 
          borderRadius: `${OPENING_REPORT_CONSTANTS.BORDER_RADIUS}px`, 
          mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` 
        }}>
          <CardContent sx={{ padding: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
            <Typography variant="h6" sx={{ mb: `${OPENING_REPORT_CONSTANTS.SPACING.SMALL}px`, fontWeight: 600 }}>
              📊 العروض المستلمة ({offersData.length})
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: OPENING_REPORT_CONSTANTS.COLORS.BACKGROUND_LIGHT }}>
                    <TableCell sx={{ fontWeight: 600 }}>المورد</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>المبلغ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>وقت الاستلام</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offersData && offersData.length > 0 ? (
                    offersData.map((offer, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{offer.supplier_name || 'Unknown'}</TableCell>
                        <TableCell>
                          {(offer.total_amount || 0).toLocaleString('ar-TN', { 
                            style: 'currency',
                            currency: 'TND',
                            minimumFractionDigits: 2 
                          })}
                        </TableCell>
                        <TableCell>
                          {new Date(offer.submitted_at).toLocaleString('ar-TN')}
                        </TableCell>
                        <TableCell>
                          {offer.is_valid ? (
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="صالح" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<ErrorIcon />} 
                              label="غير صالح" 
                              size="small" 
                              sx={{ backgroundColor: OPENING_REPORT_CONSTANTS.COLORS.ERROR, color: '#fff' }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        لا توجد عروض
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: `${OPENING_REPORT_CONSTANTS.SPACING.MEDIUM}px` }}>
          <Button 
            startIcon={<PrintIcon />} 
            onClick={() => window.print()} 
            variant="outlined"
          >
            طباعة
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={() => setExportDialog(true)} 
            variant="contained" 
            sx={{ backgroundColor: OPENING_REPORT_CONSTANTS.COLORS.PRIMARY }}
            disabled={exporting}
          >
            {exporting ? 'جاري التنزيل...' : 'تنزيل'}
          </Button>
        </Stack>

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
          <DialogTitle>تنزيل محضر الفتح</DialogTitle>
          <DialogContent sx={{ minWidth: '300px', direction: 'rtl' }}>
            <Typography>اختر الصيغة المطلوبة:</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>إلغاء</Button>
            <Button 
              onClick={() => handleExport('json')} 
              variant="contained"
              disabled={exporting}
            >
              JSON
            </Button>
            <Button 
              onClick={() => handleExport('pdf')} 
              variant="contained"
              disabled={exporting}
            >
              PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
