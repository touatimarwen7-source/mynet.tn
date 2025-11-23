import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SortIcon from '@mui/icons-material/Sort';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TableSkeleton } from '../components/Common/SkeletonLoader';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { getScoreTier, formatScore } from '../utils/evaluationCriteria';

export default function BidComparison() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    setPageTitle('Comparaison des Offres');
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenderRes = await procurementAPI.getTender(tenderId);
      const offersRes = await procurementAPI.getOffers(tenderId);
      
      setTender(tenderRes.data.tender);
      setOffers(offersRes.data.offers || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSortedOffers = () => {
    let sorted = [...offers];
    
    switch(sortBy) {
      case 'amount':
        sorted.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
        break;
      case 'score':
        sorted.sort((a, b) => (b.evaluation_score || 0) - (a.evaluation_score || 0));
        break;
      case 'supplier':
        sorted.sort((a, b) => (a.supplier_name || '').localeCompare(b.supplier_name || ''));
        break;
      case 'delivery':
        sorted.sort((a, b) => (a.delivery_time || '').localeCompare(b.delivery_time || ''));
        break;
      default:
        sorted.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
    }
    
    if (sortOrder === 'desc') sorted.reverse();
    return sorted;
  };

  const sortedOffers = getSortedOffers();
  const paginatedOffers = sortedOffers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportToCSV = () => {
    let csv = 'Fournisseur,Montant Total (TND),Délai,Paiement,Statut,Score\n';
    sortedOffers.forEach(offer => {
      csv += `"${offer.supplier_name || 'N/A'}",${offer.total_amount || 0},"${offer.delivery_time || 'N/A'}","${offer.payment_terms || 'N/A'}","${offer.status || 'submitted'}",${offer.evaluation_score || 0}\n`;
    });
    
    const element = document.createElement('a');
    element.href = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`;
    element.download = `bid-comparison-${tenderId}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'info',
      accepted: 'success',
      rejected: 'error',
      shortlisted: 'warning'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <TableSkeleton rows={5} columns={6} />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
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
            مقارنة العروض
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
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
            📊 مقارنة العروض
          </Typography>
          {tender && (
            <Typography sx={{ color: '#616161', marginBottom: '16px' }}>
              {tender.title}
            </Typography>
          )}
        </Box>

        {sortedOffers.length === 0 ? (
          <Alert severity="info">لا توجد عروض لهذه المناقصة</Alert>
        ) : (
          <Stack spacing={3}>
            {/* Sorting & Export Controls */}
            <Paper sx={{ p: '16px', backgroundColor: '#F5F5F5' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>ترتيب حسب</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(0);
                    }}
                    label="ترتيب حسب"
                  >
                    <MenuItem value="amount">المبلغ</MenuItem>
                    <MenuItem value="score">التقييم</MenuItem>
                    <MenuItem value="supplier">المورد</MenuItem>
                    <MenuItem value="delivery">التسليم</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  startIcon={<SortIcon />}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  size="small"
                  sx={{ color: theme.palette.primary.main }}
                >
                  {sortOrder === 'asc' ? '↑ تصاعدي' : '↓ تنازلي'}
                </Button>

                <Box sx={{ flex: 1 }} />

                <Button
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  variant="outlined"
                  size="small"
                  sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
                >
                  تصدير CSV
                </Button>
              </Stack>
            </Paper>

            {/* Table */}
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ padding: 0 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>المورد</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">المبلغ</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">التسليم</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">الدفع</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">الحالة</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">التقييم</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedOffers.map((offer, idx) => (
                        <TableRow key={offer.id} sx={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9', '&:hover': { backgroundColor: '#E3F2FD' } }}>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                            {offer.supplier_name || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.primary.main, textAlign: 'center' }}>
                            {parseFloat(offer.total_amount).toFixed(2)} TND
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', textAlign: 'center' }}>
                            {offer.delivery_time || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', textAlign: 'center' }}>
                            {offer.payment_terms || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', textAlign: 'center' }}>
                            <Chip
                              label={offer.status || 'مرسل'}
                              color={getStatusColor(offer.status)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', textAlign: 'center' }}>
                            {offer.evaluation_score ? `${offer.evaluation_score.toFixed(1)}/100` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={sortedOffers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="صفوف لكل صفحة:"
                />
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Tender Summary */}
        {tender && (
          <Paper sx={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5' }}>
            <Typography sx={{ fontWeight: 600, marginBottom: '12px', color: theme.palette.primary.main }}>
              📋 ملخص المناقصة
            </Typography>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                <strong>ID Référence:</strong> {tender.reference_id || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                <strong>الموعد النهائي:</strong> {new Date(tender.deadline).toLocaleDateString('ar-TN')}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                <strong>عدد العروض:</strong> {sortedOffers.length}
              </Typography>
              {tender.awardLevel && (
                <Typography sx={{ fontSize: '13px', color: '#0056B3', fontWeight: 600 }}>
                  <strong>🎯 مستوى الترسية:</strong> {tender.awardLevel === 'lot' ? 'حسب Lot' : tender.awardLevel === 'article' ? 'حسب Article' : 'شامل'}
                </Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
