
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Gavel as TenderIcon,
  Assessment as ReportsIcon,
  LocalOffer as OfferIcon,
  People as SuppliersIcon,
  TrendingUp,
  TrendingDown,
  Add as AddIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  MonetizationOn as MoneyIcon,
  PendingActions as PendingIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  AttachMoney as BudgetIcon,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import institutionalTheme from '../theme/theme';
import { setPageTitle } from '../utils/pageTitle';
import DashboardCards from '../components/DashboardCards';
import EnhancedTable from '../components/EnhancedTable';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const theme = institutionalTheme;

  useEffect(() => {
    setPageTitle('لوحة تحكم المشتري - MyNet.tn');
  }, []);

  // Advanced Statistics
  const stats = [
    { 
      label: 'المناقصات النشطة', 
      value: 12, 
      change: 15.3,
      trend: 'up',
      icon: TenderIcon, 
      color: theme.palette.primary.main,
      subtitle: '+2 هذا الأسبوع'
    },
    { 
      label: 'العروض المستلمة', 
      value: 47, 
      change: 8.7,
      trend: 'up',
      icon: OfferIcon, 
      color: theme.palette.success.main,
      subtitle: 'متوسط 4 عروض/مناقصة'
    },
    { 
      label: 'الميزانية المتاحة', 
      value: '2.4M TND', 
      change: -3.2,
      trend: 'down',
      icon: BudgetIcon, 
      color: theme.palette.info.main,
      subtitle: '68% مستخدمة'
    },
    { 
      label: 'معدل التوفير', 
      value: '18.5%', 
      change: 5.1,
      trend: 'up',
      icon: MoneyIcon, 
      color: theme.palette.warning.main,
      subtitle: 'مقارنة بالميزانية'
    },
  ];

  // Tender Status Distribution
  const tenderDistribution = [
    { name: 'نشطة', value: 12, color: theme.palette.primary.main },
    { name: 'قيد التقييم', value: 8, color: theme.palette.warning.main },
    { name: 'مكتملة', value: 23, color: theme.palette.success.main },
    { name: 'ملغاة', value: 3, color: theme.palette.error.main },
  ];

  // Monthly Trends
  const monthlyData = [
    { month: 'يناير', tenders: 8, offers: 32, savings: 12 },
    { month: 'فبراير', tenders: 12, offers: 45, savings: 15 },
    { month: 'مارس', tenders: 15, offers: 58, savings: 22 },
    { month: 'أبريل', tenders: 10, offers: 38, savings: 18 },
    { month: 'مايو', tenders: 14, offers: 52, savings: 25 },
    { month: 'يونيو', tenders: 12, offers: 47, savings: 18 },
  ];

  // Active Tenders Table
  const activeTenders = [
    { 
      id: 1, 
      title: 'توريد معدات مكتبية', 
      status: 'نشط', 
      offers: 8, 
      deadline: '2025-01-15',
      budget: '150,000 TND',
      progress: 65
    },
    { 
      id: 2, 
      title: 'خدمات صيانة شاملة', 
      status: 'قيد التقييم', 
      offers: 12, 
      deadline: '2025-01-10',
      budget: '280,000 TND',
      progress: 85
    },
    { 
      id: 3, 
      title: 'شراء أجهزة كمبيوتر', 
      status: 'نشط', 
      offers: 5, 
      deadline: '2025-01-20',
      budget: '420,000 TND',
      progress: 45
    },
  ];

  const tableColumns = [
    { key: 'title', label: 'عنوان المناقصة' },
    { 
      key: 'status', 
      label: 'الحالة',
      render: (val) => (
        <Chip 
          label={val} 
          size="small"
          color={val === 'نشط' ? 'primary' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      )
    },
    { key: 'offers', label: 'عدد العروض' },
    { key: 'deadline', label: 'الموعد النهائي' },
    { key: 'budget', label: 'الميزانية' },
    {
      key: 'progress',
      label: 'التقدم',
      render: (val) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={val} 
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" sx={{ minWidth: 35 }}>{val}%</Typography>
        </Box>
      )
    },
  ];

  const quickActions = [
    { 
      label: 'إنشاء مناقصة جديدة', 
      path: '/create-tender', 
      color: 'primary',
      icon: AddIcon,
      description: 'إطلاق مناقصة جديدة'
    },
    { 
      label: 'المناقصات النشطة', 
      path: '/buyer-active-tenders', 
      color: 'secondary',
      icon: ViewIcon,
      description: 'عرض وإدارة المناقصات'
    },
    { 
      label: 'مقارنة العروض', 
      path: '/tenders', 
      color: 'info',
      icon: AnalyticsIcon,
      description: 'تحليل ومقارنة العروض'
    },
    { 
      label: 'التقارير المالية', 
      path: '/financial-reports', 
      color: 'success',
      icon: ReportsIcon,
      description: 'تقارير مفصلة'
    },
    { 
      label: 'إدارة الفريق', 
      path: '/team-management', 
      color: 'warning',
      icon: PeopleIcon,
      description: 'إدارة أعضاء الفريق'
    },
    { 
      label: 'الميزانيات', 
      path: '/budgets', 
      color: 'error',
      icon: BudgetIcon,
      description: 'إدارة الميزانيات'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                mb: 1 
              }}
            >
              لوحة تحكم المشتري
            </Typography>
            <Typography variant="body2" color="textSecondary">
              إدارة شاملة للمناقصات والمشتريات
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => navigate('/create-tender')}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            مناقصة جديدة
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: `${stat.color}15`, width: 56, height: 56 }}>
                    <stat.icon sx={{ fontSize: 28, color: stat.color }} />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {stat.trend === 'up' ? (
                    <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: stat.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600
                    }}
                  >
                    {Math.abs(stat.change)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    عن الشهر الماضي
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                اتجاهات الأداء الشهري
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <ChartTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tenders" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    name="المناقصات"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="offers" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={3}
                    name="العروض"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke={theme.palette.warning.main} 
                    strokeWidth={3}
                    name="التوفير %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tender Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                توزيع المناقصات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tenderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tenderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            إجراءات سريعة
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: `${theme.palette.primary.main}08`,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <Stack spacing={1.5}>
                    <Avatar sx={{ backgroundColor: `${theme.palette[action.color].main}15` }}>
                      <action.icon sx={{ color: theme.palette[action.color].main }} />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {action.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {action.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Active Tenders Table */}
      <Card sx={{ border: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              المناقصات النشطة
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/buyer-active-tenders')}
              sx={{ textTransform: 'none' }}
            >
              عرض الكل
            </Button>
          </Stack>
          <EnhancedTable
            data={activeTenders}
            columns={tableColumns}
            onRowClick={(row) => navigate(`/tender/${row.id}`)}
            striped
          />
        </CardContent>
      </Card>
    </Container>
  );
}
