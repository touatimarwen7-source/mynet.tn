/**
 * لوحة تحكم الإدارة - Admin Dashboard
 * واجهة شاملة للمسؤولين مع إدارة النظام والمستخدمين
 * @component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Button, Typography, Stack, Paper, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Drawer,
  Grid, Alert, Chip
} from '@mui/material';
import {
  Dashboard, People, BarChart, Person, Settings, HealthAndSafety, Security,
  Assessment, CheckCircle, TrendingUp
} from '@mui/icons-material';
import { logger } from '../utils/logger';
import EnhancedErrorBoundary from '../components/EnhancedErrorBoundary';
import { InfoCard } from '../components/ProfessionalComponents';
import institutionalTheme from '../theme/theme';

const THEME = institutionalTheme;
const DRAWER_WIDTH = 280;

function AdminDashboardContent() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 150,
    totalTenders: 45,
    totalOffers: 320,
    systemHealth: 'good'
  });

  useEffect(() => {
    setStats({
      totalUsers: 150,
      totalTenders: 45,
      totalOffers: 320,
      systemHealth: 'good'
    });
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Dashboard },
    { id: 'users', label: 'إدارة المستخدمين', icon: People },
    { id: 'analytics', label: 'الإحصائيات والتحليلات', icon: BarChart },
    { id: 'health', label: 'صحة النظام', icon: HealthAndSafety },
    { id: 'security', label: 'الأمان والتدقيق', icon: Security },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const dashboardStats = [
    { label: 'إجمالي المستخدمين', value: String(stats.totalUsers), change: 12, icon: People, color: '#0056B3' },
    { label: 'إجمالي المناقصات', value: String(stats.totalTenders), change: 8, icon: Assessment, color: '#2e7d32' },
    { label: 'إجمالي العروض', value: String(stats.totalOffers), change: 24, icon: TrendingUp, color: '#f57c00' },
    { label: 'حالة النظام', value: stats.systemHealth === 'good' ? 'جيدة' : 'تحذير', change: 0, icon: HealthAndSafety, color: '#0288d1' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Box>
            <Paper elevation={0} sx={{
              background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
              borderRadius: '12px', padding: '32px', marginBottom: '24px',
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                لوحة تحكم الإدارة
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                إدارة النظام والمستخدمين والأمان
              </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {dashboardStats.map((stat, idx) => (
                <Grid item xs={12} md={6} lg={3} key={idx}>
                  <InfoCard {...stat} loading={loading} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>حالة النظام</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>قاعدة البيانات</Typography>
                      <Chip label="عاملة" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>خادم الويب</Typography>
                      <Chip label="عاملة" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>البريد الإلكتروني</Typography>
                      <Chip label="عاملة" color="success" size="small" />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>النشاط الأخير</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Alert severity="info">10 مستخدمين جدد أمس</Alert>
                    <Alert severity="success">5 مناقصات نشطة جديدة</Alert>
                    <Alert severity="warning">20 عرض قيد المراجعة</Alert>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'users':
        return (
          <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>إدارة المستخدمين</Typography>
              <Button variant="contained" onClick={() => navigate('/admin/users')}>عرض الكل</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth onClick={() => navigate('/admin/users')}>
                <People sx={{ mr: 1 }} /> إدارة حسابات المستخدمين
              </Button>
              <Button variant="outlined" fullWidth>إدارة الأدوار والصلاحيات</Button>
              <Button variant="outlined" fullWidth>تفعيل/تعطيل المستخدمين</Button>
              <Button variant="outlined" fullWidth>إعادة تعيين كلمات المرور</Button>
            </Stack>
          </Paper>
        );

      case 'analytics':
        return (
          <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>الإحصائيات والتحليلات</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth>تقارير المستخدمين</Button>
              <Button variant="outlined" fullWidth>تقارير المناقصات والعروض</Button>
              <Button variant="outlined" fullWidth>تحليل الأداء</Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/admin/health')}>إحصائيات النظام</Button>
            </Stack>
          </Paper>
        );

      case 'health':
        return (
          <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>صحة النظام</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Alert severity="success" icon={<CheckCircle />}>
                النظام يعمل بشكل طبيعي - استجابة سريعة وآمنة
              </Alert>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>معلومات النظام:</Typography>
                <Typography variant="caption" display="block">• وقت الاستجابة: &lt; 200ms</Typography>
                <Typography variant="caption" display="block">• معدل الأخطاء: 0.1%</Typography>
                <Typography variant="caption" display="block">• عدد المستخدمين النشطين: {stats.totalUsers}</Typography>
              </Box>
            </Stack>
          </Paper>
        );

      case 'security':
        return (
          <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>الأمان والتدقيق</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth>
                <Security sx={{ mr: 1 }} /> سجل التدقيق
              </Button>
              <Button variant="outlined" fullWidth>سجلات تسجيل الدخول</Button>
              <Button variant="outlined" fullWidth>إدارة شهادات SSL</Button>
              <Button variant="outlined" fullWidth>النسخ الاحتياطية والاستعادة</Button>
            </Stack>
          </Paper>
        );

      case 'settings':
        return (
          <Paper elevation={0} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>إعدادات النظام</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth>
                <Settings sx={{ mr: 1 }} /> إعدادات عامة
              </Button>
              <Button variant="outlined" fullWidth>إعدادات الأمان</Button>
              <Button variant="outlined" fullWidth>إعدادات البريد الإلكتروني</Button>
              <Button variant="outlined" fullWidth>إعدادات الإشعارات</Button>
            </Stack>
          </Paper>
        );

      default:
        return null;
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#D32F2F' }}>لوحة الإدارة</Typography>
      </Box>
      <List sx={{ flex: 1, pt: 0 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
            sx={{
              borderRight: activeSection === item.id ? '3px solid #D32F2F' : 'none',
              backgroundColor: activeSection === item.id ? '#ffebee' : 'transparent',
              '&:hover': { backgroundColor: '#ffebee' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: activeSection === item.id ? '#D32F2F' : 'inherit' }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9F9F9' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: { xs: '60px', md: '64px' },
            height: 'calc(100vh - 64px)',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #e0e0e0'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
}

export default function AdminDashboard() {
  return (
    <EnhancedErrorBoundary>
      <AdminDashboardContent />
    </EnhancedErrorBoundary>
  );
}
            Tableau de Bord - Admin
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#616161',
              marginBottom: '16px',
            }}
          >
            Permissions Limitées - Admin
          </Typography>
          
          <Alert 
            severity="info" 
            sx={{ 
              marginBottom: '24px',
              backgroundColor: '#E3F2FD',
              borderColor: '#90CAF9',
              color: '#1565C0'
            }}
          >
            Vous avez des permissions limitées déléguées par le Super Admin. Pour accéder à tous les outils de contrôle, contactez le Super Admin.
          </Alert>
        </Box>

        {/* Main Content */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Tabs
            value={currentTab}
            onChange={(e, value) => setCurrentTab(value)}
            sx={{
              borderBottom: '1px solid #E0E0E0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: '#616161',
                padding: '12px 16px',
                '&.Mui-selected': {
                  color: institutionalTheme.palette.primary.main,
                  backgroundColor: '#F0F4FF'
                }
              }
            }}
          >
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minWidth: 'auto' }}
                title={tab.description}
              />
            ))}
          </Tabs>

          {/* Tab Description */}
          <Box sx={{ padding: '16px 24px', borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA' }}>
            <Typography sx={{ fontSize: '12px', color: institutionalTheme.palette.text.secondary }}>
              📌 {tabs[currentTab].description}
            </Typography>
          </Box>

          {/* Tab Content */}
          <Box sx={{ padding: '24px' }}>
            {tabs[currentTab].component}
          </Box>
        </Box>

        <Box sx={{ marginTop: '32px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
          <Typography sx={{ fontSize: '12px', color: '#999999', lineHeight: '1.6' }}>
            <strong>Note:</strong> En tant qu'Admin, vous avez des permissions limitées uniquement. 
            Pour accéder au contrôle complet (Centre de Contrôle Total), vous devez être Super Admin.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
