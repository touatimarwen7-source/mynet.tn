/**
 * لوحة تحكم المشتري - Buyer Dashboard
 * واجهة احترافية عالمية للمشترين
 * @component
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Card, CardContent, Grid, Button, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, CircularProgress, LinearProgress, Chip, Tabs, Tab, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Avatar, Stack, Badge, Tooltip,
  Rating, IconButton, Paper, Divider
} from '@mui/material';
import {
  Add, Visibility, FileDownload, Assignment, TrendingUp, TrendingDown, Refresh,
  CheckCircle, Schedule, AlertTriangle, Edit, Delete, Share, Download, MoreVert
} from '@mui/icons-material';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { logger } from '../utils/logger';
import EnhancedErrorBoundary from '../components/EnhancedErrorBoundary';
import { InfoCard } from '../components/ProfessionalComponents';

const THEME = institutionalTheme;

function BuyerDashboardContent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tenders, setTenders] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchTenderData();
  }, []);

  const fetchTenderData = async () => {
    try {
      setLoading(true);
      const [tendersRes, offersRes] = await Promise.all([
        procurementAPI.getMyTenders({ limit: 10 }),
        procurementAPI.getMyOffers()
      ]);
      
      setTenders(tendersRes?.data?.tenders || []);
      setOffers(offersRes?.data?.offers || []);
    } catch (err) {
      logger.error('Failed to load dashboard data:', err);
      setSnackbar({ open: true, message: 'خطأ في تحميل البيانات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'الأجل النشطة', value: String(tenders.filter(t => t.status === 'open').length), change: 12, icon: Assignment, color: '#0056B3' },
    { label: 'متوسط الادخار', value: '18.5%', change: 5, icon: TrendingDown, color: '#2e7d32' },
    { label: 'العروض المنتظرة', value: String(offers.filter(o => o.status === 'submitted').length), change: -3, icon: Schedule, color: '#f57c00' },
    { label: 'معدل الإغلاق', value: '92%', change: 8, icon: CheckCircle, color: '#0288d1' },
  ];

  const recentTenders = tenders.slice(0, 5).map((tender, idx) => ({
    id: tender.id,
    title: tender.title || 'مناقصة',
    budget: `د.ت ${tender.budget_max || 0}`,
    deadline: new Date(tender.created_at).toLocaleDateString('ar-TN'),
    offers: offers.filter(o => o.tender_id === tender.id).length,
    status: tender.status === 'open' ? 'نشطة' : 'مغلقة'
  }));

  const topSuppliers = [
    { rank: 1, name: 'شركة العتيبي للتوريد', rating: 4.8, deals: 45, responseTime: '< 2 ساعة' },
    { rank: 2, name: 'فاطمة المرزوقي', rating: 4.7, deals: 38, responseTime: '< 4 ساعات' },
    { rank: 3, name: 'أحمد الخليفة', rating: 4.5, deals: 32, responseTime: '< 6 ساعات' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9F9F9', paddingY: 4 }}>
      <Container maxWidth="xl">
        {/* الرأس */}
        <Paper elevation={0} sx={{
          background: 'linear-gradient(135deg, #0056B3 0%, #003d82 100%)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Stack>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              مرحباً بك في لوحة التحكم
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
              إدارة المناقصات والعروض بكفاءة عالية
            </Typography>
          </Stack>
          <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            مناقصة جديدة
          </Button>
        </Paper>

        {/* الإحصائيات الرئيسية */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <InfoCard {...stat} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* التبويبات */}
        <Paper elevation={0} sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
              '& .Mui-selected': { color: THEME.palette.primary.main, fontWeight: 700 }
            }}
          >
            <Tab label="📋 الأجل النشطة" />
            <Tab label="⭐ أفضل الموردين" />
            <Tab label="📊 التحليلات" />
            <Tab label="📜 السجل" />
          </Tabs>

          <Box sx={{ padding: '24px' }}>
            {tabValue === 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>اسم المناقصة</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الميزانية</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الموعد النهائي</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>العروض</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTenders.map((tender) => (
                      <TableRow key={tender.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{tender.title}</TableCell>
                        <TableCell><Chip label={tender.budget} size="small" variant="outlined" /></TableCell>
                        <TableCell>{tender.deadline}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${tender.offers} عرض`}
                            icon={<TrendingUp />}
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tender.status}
                            size="small"
                            color={tender.status === 'نشطة' ? 'success' : 'warning'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="عرض">
                              <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="تعديل">
                              <IconButton size="small"><Edit fontSize="small" /></IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {tabValue === 1 && (
              <Stack spacing={2}>
                {topSuppliers.map((supplier) => (
                  <Paper key={supplier.rank} sx={{
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,86,179,0.15)' }
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                        <Badge badgeContent={`${supplier.rank}`} color="primary">
                          <Avatar sx={{ width: 48, height: 48, backgroundColor: THEME.palette.primary.main }}>
                            {supplier.name[0]}
                          </Avatar>
                        </Badge>
                        <Stack flex={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{supplier.name}</Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                            <Rating value={supplier.rating / 5} readOnly size="small" precision={0.1} />
                            <Typography variant="caption">{supplier.rating}</Typography>
                            <Chip label={`${supplier.deals} صفقة`} size="small" variant="outlined" />
                          </Stack>
                        </Stack>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="textSecondary">وقت الرد</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{supplier.responseTime}</Typography>
                        </Box>
                        <Button variant="contained" size="small">تفاصيل</Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>متوسط وقت الاستجابة</Typography>
                      <Typography variant="h4" sx={{ color: THEME.palette.primary.main, fontWeight: 700 }}>
                        3.2 ساعات
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        ↓ 15% من الفترة السابقة
                      </Typography>
                      <LinearProgress variant="determinate" value={65} sx={{ mt: 2, height: 8, borderRadius: '4px' }} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>معدل الرضا</Typography>
                      <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                        4.7 / 5
                      </Typography>
                      <Rating value={4.7} readOnly size="large" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
                سجل الأنشطة الأخيرة: 23 مناقصة مكتملة • 145 عرض تم استقبالها • 98 عقد تم إبرامه
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function BuyerDashboard() {
  return (
    <ErrorBoundary>
      <BuyerDashboardContent />
    </ErrorBoundary>
  );
}
