/**
 * لوحة تحكم المزود - Supplier Dashboard
 * واجهة احترافية عالمية للموردين
 * @component
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Card, CardContent, Grid, Button, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, Chip, Tabs, Tab, Alert, Avatar, Stack, Badge, Tooltip, Rating,
  IconButton, Paper, LinearProgress, Divider, CircularProgress
} from '@mui/material';
import {
  Add, Visibility, Edit, Delete, TrendingUp, CheckCircle, Clock, AlertTriangle,
  Send, Download, Refresh, Share, MoreVert
} from '@mui/icons-material';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { logger } from '../utils/logger';
import EnhancedErrorBoundary from '../components/EnhancedErrorBoundary';
import { InfoCard } from '../components/ProfessionalComponents';

const THEME = institutionalTheme;

function SupplierDashboardContent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const stats = [
    { label: 'الأجل المتاحة', value: '156', change: 24, icon: Edit, color: '#0056B3' },
    { label: 'العروض المرسلة', value: '89', change: 18, icon: Send, color: '#2e7d32' },
    { label: 'معدل الفوز', value: '64%', change: 12, icon: TrendingUp, color: '#f57c00' },
    { label: 'الإيرادات الشهرية', value: 'د.ت 450K', change: 31, icon: CheckCircle, color: '#0288d1' },
  ];

  const activeTenders = [
    { id: 1, title: 'شراء أجهزة حاسوب', buyer: 'شركة النجاح', budget: 'د.ت 50,000', deadline: '2025-02-15', status: 'متاحة' },
    { id: 2, title: 'توريد مواد بناء', buyer: 'وزارة الأشغال', budget: 'د.ت 120,000', deadline: '2025-02-20', status: 'متاحة' },
    { id: 3, title: 'خدمات الصيانة', buyer: 'البلدية', budget: 'د.ت 30,000', deadline: '2025-02-10', status: 'قريبة من الإغلاق' },
  ];

  const myOffers = [
    { id: 1, tender: 'شراء أجهزة حاسوب', amount: 'د.ت 48,500', date: '2025-01-20', status: 'قيد المراجعة', rating: 4.8 },
    { id: 2, tender: 'توريد مواد بناء', amount: 'د.ت 118,000', date: '2025-01-18', status: 'مقبول', rating: 5.0 },
    { id: 3, tender: 'خدمات الصيانة', amount: 'د.ت 29,000', date: '2025-01-15', status: 'مرفوض', rating: 4.5 },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9F9F9', paddingY: 4 }}>
      <Container maxWidth="xl">
        {/* الرأس */}
        <Paper elevation={0} sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
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
              منصة التوريد الاحترافية
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
              ابحث عن الفرص المربحة وقدم عروضك الفائزة
            </Typography>
          </Stack>
          <Button variant="contained" startIcon={<Send />} sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            عرض جديد
          </Button>
        </Paper>

        {/* الإحصائيات الرئيسية */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <InfoCard {...stat} />
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
              '& .Mui-selected': { color: '#2e7d32', fontWeight: 700 }
            }}
          >
            <Tab label="🎯 الأجل المتاحة" />
            <Tab label="📤 عروضي" />
            <Tab label="📊 الأداء" />
            <Tab label="⭐ التقييمات" />
          </Tabs>

          <Box sx={{ padding: '24px' }}>
            {tabValue === 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>اسم المشروع</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>المشتري</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الميزانية</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الموعد</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>الإجراء</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeTenders.map((tender) => (
                      <TableRow key={tender.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{tender.title}</TableCell>
                        <TableCell>{tender.buyer}</TableCell>
                        <TableCell><Chip label={tender.budget} size="small" variant="outlined" /></TableCell>
                        <TableCell>{tender.deadline}</TableCell>
                        <TableCell>
                          <Chip
                            label={tender.status}
                            size="small"
                            color={tender.status === 'متاحة' ? 'success' : 'warning'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="contained" startIcon={<Send />}>
                            قدم عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {tabValue === 1 && (
              <Stack spacing={2}>
                {myOffers.map((offer) => (
                  <Paper key={offer.id} sx={{
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 4px 12px rgba(46,125,50,0.15)' }
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack flex={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.tender}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                          <Chip label={offer.amount} size="small" color="primary" variant="filled" />
                          <Chip label={offer.date} size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          label={offer.status}
                          size="small"
                          color={offer.status === 'مقبول' ? 'success' : offer.status === 'مرفوض' ? 'error' : 'warning'}
                          variant="filled"
                        />
                        <Rating value={offer.rating / 5} readOnly size="small" />
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
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>معدل النجاح</Typography>
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress
                          variant="determinate"
                          value={64}
                          size={80}
                          sx={{ color: '#2e7d32' }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#2e7d32' }}>64%</Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
                        من 89 عرض مرسل
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>مؤشرات الأداء</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption">سرعة الاستجابة</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>92%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={92} sx={{ height: 6, borderRadius: '3px' }} />
                        </Box>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption">جودة العروض</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>88%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: '3px' }} />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Stack spacing={2}>
                <Alert severity="success" sx={{ borderRadius: '8px' }}>
                  ⭐ متوسط التقييم: 4.8 من 5 • استنادا إلى 23 تقييم من المشترين
                </Alert>
                <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Stack spacing={2}>
                    {[
                      { label: 'الاحترافية', value: 4.9 },
                      { label: 'التزام المواعيد', value: 4.8 },
                      { label: 'جودة الخدمة', value: 4.7 },
                      { label: 'التواصل', value: 4.9 }
                    ].map((rating, idx) => (
                      <Box key={idx}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{rating.label}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{rating.value}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(rating.value / 5) * 100}
                          sx={{ height: 8, borderRadius: '4px' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function SupplierDashboard() {
  return (
    <EnhancedErrorBoundary>
      <SupplierDashboardContent />
    </EnhancedErrorBoundary>
  );
}
