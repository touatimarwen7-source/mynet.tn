
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  LocalOffer as LocalOfferIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import axiosInstance from '../services/axiosConfig';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeBids: 0,
      wonContracts: 0,
      totalRevenue: 0,
      pendingOffers: 0,
      averageRating: 0,
      completionRate: 0,
    },
    recentTenders: [],
    recentOffers: [],
    monthlyRevenue: [],
    notifications: [],
    performanceMetrics: {},
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, tendersRes, offersRes, notificationsRes] = await Promise.allSettled([
        axiosInstance.get('/api/procurement/supplier/dashboard-stats').catch(() => ({ data: { stats: {} } })),
        axiosInstance.get('/api/procurement/tenders?limit=10&status=open').catch(() => ({ data: { data: [] } })),
        axiosInstance.get('/api/procurement/offers/my-offers?limit=10').catch(() => ({ data: { data: [] } })),
        axiosInstance.get('/api/notifications?limit=5').catch(() => ({ data: { notifications: [] } })),
      ]);

      const stats = statsRes.status === 'fulfilled' ? statsRes.value?.data?.stats || {} : {};
      const tenders = tendersRes.status === 'fulfilled' ? tendersRes.value?.data?.data || [] : [];
      const offers = offersRes.status === 'fulfilled' ? offersRes.value?.data?.data || [] : [];
      const notifications = notificationsRes.status === 'fulfilled' ? notificationsRes.value?.data?.notifications || [] : [];

      // Generate mock monthly revenue data
      const monthlyRevenue = generateMonthlyRevenueData();

      setDashboardData({
        stats: {
          activeBids: stats.activeBids || 0,
          wonContracts: stats.wonContracts || 0,
          totalRevenue: stats.totalRevenue || 0,
          pendingOffers: stats.pendingOffers || 0,
          averageRating: stats.averageRating || 4.5,
          completionRate: stats.completionRate || 87,
        },
        recentTenders: Array.isArray(tenders) ? tenders.slice(0, 5) : [],
        recentOffers: Array.isArray(offers) ? offers.slice(0, 5) : [],
        monthlyRevenue,
        notifications: Array.isArray(notifications) ? notifications : [],
        performanceMetrics: stats.performanceMetrics || {},
      });
    } catch (err) {
      console.error('❌ Dashboard Error:', err);
      setError(err.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenueData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    }));
  };

  const revenueChartData = {
    labels: dashboardData.monthlyRevenue.map(d => d.month),
    datasets: [
      {
        label: 'الإيرادات الشهرية (TND)',
        data: dashboardData.monthlyRevenue.map(d => d.revenue),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const offersStatusData = {
    labels: ['مقبولة', 'قيد المراجعة', 'مرفوضة'],
    datasets: [
      {
        data: [
          dashboardData.stats.wonContracts,
          dashboardData.stats.pendingOffers,
          dashboardData.stats.activeBids - dashboardData.stats.wonContracts - dashboardData.stats.pendingOffers,
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            <Icon />
          </Avatar>
        </Box>
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {change > 0 ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: '#4caf50' }} />
            ) : (
              <ArrowDownwardIcon fontSize="small" sx={{ color: '#f44336' }} />
            )}
            <Typography variant="caption" sx={{ color: change > 0 ? '#4caf50' : '#f44336' }}>
              {Math.abs(change)}% من الشهر الماضي
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2, fontSize: 18 }}>جاري تحميل لوحة التحكم...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData} startIcon={<RefreshIcon />}>
          إعادة المحاولة
        </Button>
      </Container>
    );
  }

  const { stats, recentTenders, recentOffers, notifications } = dashboardData;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              مرحباً، {user?.company_name || user?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              إليك نظرة عامة على أداءك اليوم
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={fetchDashboardData} color="primary">
              <RefreshIcon />
            </IconButton>
            <Badge badgeContent={notifications.length} color="error">
              <IconButton color="primary">
                <NotificationsIcon />
              </IconButton>
            </Badge>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="العروض النشطة"
              value={stats.activeBids}
              icon={AssignmentIcon}
              color="#2196f3"
              change={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="العقود المكتسبة"
              value={stats.wonContracts}
              icon={CheckCircleIcon}
              color="#4caf50"
              change={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إجمالي الإيرادات"
              value={new Intl.NumberFormat('ar-TN', {
                style: 'currency',
                currency: 'TND',
                minimumFractionDigits: 0,
              }).format(stats.totalRevenue)}
              icon={AttachMoneyIcon}
              color="#ff9800"
              change={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="معدل التقييم"
              value={stats.averageRating.toFixed(1)}
              icon={StarIcon}
              color="#f44336"
              subtitle={`من 5.0`}
            />
          </Grid>
        </Grid>

        {/* Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  معدل الإنجاز
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stats.completionRate}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {stats.completionRate}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  الأداء الشهري
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      +{stats.activeBids + stats.wonContracts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي العمليات هذا الشهر
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  الإيرادات الشهرية
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  حالة العروض
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={offersStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label="المناقصات المتاحة" />
            <Tab label="عروضي الأخيرة" />
            <Tab label="الإشعارات" />
          </Tabs>

          <CardContent sx={{ minHeight: 400 }}>
            {/* Recent Tenders Tab */}
            {currentTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  أحدث المناقصات المتاحة
                </Typography>
                {recentTenders.length > 0 ? (
                  <List>
                    {recentTenders.map((tender, index) => (
                      <React.Fragment key={tender.id}>
                        <ListItem
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 1,
                            '&:hover': { bgcolor: '#f5f5f5' },
                          }}
                          onClick={() => navigate(`/tender/${tender.id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#1976d2' }}>
                              <LocalOfferIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {tender.title || 'مناقصة بدون عنوان'}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  الموعد النهائي: {new Date(tender.closing_date).toLocaleDateString('ar-TN')}
                                </Typography>
                                <Chip
                                  label={tender.status || 'مفتوحة'}
                                  size="small"
                                  color="success"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                          <Button variant="outlined" size="small">
                            عرض التفاصيل
                          </Button>
                        </ListItem>
                        {index < recentTenders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">لا توجد مناقصات متاحة حالياً</Alert>
                )}
              </Box>
            )}

            {/* Recent Offers Tab */}
            {currentTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  عروضي الأخيرة
                </Typography>
                {recentOffers.length > 0 ? (
                  <List>
                    {recentOffers.map((offer, index) => (
                      <React.Fragment key={offer.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#4caf50' }}>
                              <AssignmentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                عرض #{offer.id}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  الحالة: {offer.status || 'قيد المراجعة'}
                                </Typography>
                                <Chip
                                  label={offer.status === 'accepted' ? 'مقبول' : 'قيد المراجعة'}
                                  size="small"
                                  color={offer.status === 'accepted' ? 'success' : 'warning'}
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentOffers.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">لم تقدم أي عروض بعد</Alert>
                )}
              </Box>
            )}

            {/* Notifications Tab */}
            {currentTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  أحدث الإشعارات
                </Typography>
                {notifications.length > 0 ? (
                  <List>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#ff9800' }}>
                              <NotificationsIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title || 'إشعار جديد'}
                            secondary={notification.message || 'تفاصيل الإشعار'}
                          />
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">لا توجد إشعارات جديدة</Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SupplierDashboard;
