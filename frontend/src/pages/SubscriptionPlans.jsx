
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import api from '../services/api';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

export default function SubscriptionPlans() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState('stripe');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/admin/subscriptions/plans');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('خطأ في تحميل الباقات:', error);
      setMessage('خطأ في تحميل الباقات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/payments/subscription/status');
      setCurrentSubscription(response.data.data);
    } catch (error) {
      console.error('خطأ في تحميل الاشتراك:', error);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPaymentDialog(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    try {
      // إنشاء جلسة الدفع
      const response = await api.post('/payments/create-session', {
        planId: selectedPlan.id,
        provider: paymentProvider
      });

      // إعادة التوجيه إلى صفحة الدفع
      window.location.href = response.data.data.url;
    } catch (error) {
      console.error('خطأ في بدء عملية الدفع:', error);
      setMessage(error.response?.data?.error || 'خطأ في بدء عملية الدفع');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: theme.palette.text.primary, marginBottom: '16px' }}
          >
            باقات الاشتراك - Subscription Plans
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
            اختر الباقة المناسبة لاحتياجاتك. جميع الباقات تشمل الدعم الفني والتحديثات المستمرة.
          </Typography>

          {currentSubscription?.hasActiveSubscription && (
            <Alert severity="info" sx={{ marginTop: '24px', maxWidth: '600px', margin: '24px auto 0' }}>
              لديك اشتراك نشط: <strong>{currentSubscription.subscription?.plan_name}</strong>
              <br />
              ينتهي في: {new Date(currentSubscription.subscription?.end_date).toLocaleDateString('ar-TN')}
            </Alert>
          )}

          {currentSubscription?.isTrialPeriod && !currentSubscription?.hasActiveSubscription && (
            <Alert severity="warning" sx={{ marginTop: '24px', maxWidth: '600px', margin: '24px auto 0' }}>
              🎉 أنت في الفترة التجريبية المجانية! استمتع بجميع الميزات مجاناً.
            </Alert>
          )}

          {message && (
            <Alert severity="error" sx={{ marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
              {message}
            </Alert>
          )}
        </Box>

        {/* Plans Grid */}
        <Grid container spacing={3}>
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.subscription?.plan_id === plan.id;
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
            const isPopular = plan.price > 0 && plan.price < 500;

            return (
              <Grid xs={12} md={4} key={plan.id}>
                <Card
                  sx={{
                    border: isPopular ? '2px solid #0056B3' : '1px solid #e0e0e0',
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isCurrentPlan ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isCurrentPlan ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {isPopular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <StarIcon sx={{ fontSize: '14px' }} />
                      الأكثر شعبية
                    </Box>
                  )}

                  {isCurrentPlan && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '-12px',
                        right: '16px',
                        backgroundColor: '#2e7d32',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      اشتراكك الحالي
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '24px',
                        color: theme.palette.text.primary,
                        marginBottom: '8px',
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#666', marginBottom: '24px', minHeight: '40px' }}>
                      {plan.description}
                    </Typography>

                    <Box sx={{ marginBottom: '24px' }}>
                      <Typography
                        sx={{
                          fontSize: '36px',
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'baseline',
                        }}
                      >
                        {plan.price}
                        <Typography component="span" sx={{ fontSize: '16px', fontWeight: 400, color: '#666', marginLeft: '8px' }}>
                          {plan.currency}
                        </Typography>
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#999' }}>
                        لمدة {plan.duration_days} يوم
                      </Typography>
                    </Box>

                    <Divider sx={{ marginY: '16px' }} />

                    <List sx={{ flex: 1, padding: 0 }}>
                      <ListItem sx={{ padding: '8px 0' }}>
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${plan.max_tenders === -1 ? 'غير محدود' : plan.max_tenders} مناقصة`}
                          primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                        />
                      </ListItem>

                      <ListItem sx={{ padding: '8px 0' }}>
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${plan.max_offers === -1 ? 'غير محدود' : plan.max_offers} عرض`}
                          primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                        />
                      </ListItem>

                      <ListItem sx={{ padding: '8px 0' }}>
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${plan.max_products} منتج`}
                          primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                        />
                      </ListItem>

                      <ListItem sx={{ padding: '8px 0' }}>
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${plan.storage_limit} GB تخزين`}
                          primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                        />
                      </ListItem>

                      {Object.entries(features || {}).map(([key, value]) => 
                        value && (
                          <ListItem key={key} sx={{ padding: '8px 0' }}>
                            <ListItemIcon sx={{ minWidth: '32px' }}>
                              <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={key}
                              primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>

                    <Button
                      variant={isCurrentPlan ? 'outlined' : isPopular ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrentPlan}
                      sx={{
                        marginTop: '24px',
                        backgroundColor: isPopular && !isCurrentPlan ? theme.palette.primary.main : 'transparent',
                        color: isPopular && !isCurrentPlan ? '#fff' : theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        fontWeight: 600,
                        padding: '12px',
                        '&:hover': {
                          backgroundColor: isPopular && !isCurrentPlan ? '#003d7a' : '#f5f5f5',
                        },
                      }}
                    >
                      {isCurrentPlan ? 'اشتراكك الحالي' : 'اختر هذه الباقة'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Features Comparison */}
        <Box sx={{ marginTop: '64px' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            لماذا تختار MyNet.tn؟
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} lg={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', padding: '24px' }}>
                <SecurityIcon sx={{ fontSize: '48px', color: theme.palette.primary.main, marginBottom: '16px' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>
                  آمن ومضمون
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  جميع المعاملات محمية بأعلى معايير الأمان والتشفير
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} lg={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', padding: '24px' }}>
                <SpeedIcon sx={{ fontSize: '48px', color: theme.palette.primary.main, marginBottom: '16px' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>
                  سريع وفعال
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  منصة سريعة وسهلة الاستخدام لإدارة جميع احتياجاتك
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} lg={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', padding: '24px' }}>
                <PaymentIcon sx={{ fontSize: '48px', color: theme.palette.primary.main, marginBottom: '16px' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>
                  طرق دفع متعددة
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  ادفع بالطريقة التي تناسبك: بطاقة، D17، Flouci
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إتمام عملية الدفع</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ paddingY: '16px' }}>
              <Alert severity="info" sx={{ marginBottom: '24px' }}>
                لقد اخترت باقة <strong>{selectedPlan.name}</strong>
                <br />
                المبلغ: <strong>{selectedPlan.price} {selectedPlan.currency}</strong>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>اختر طريقة الدفع</InputLabel>
                <Select
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value)}
                  label="اختر طريقة الدفع"
                >
                  <MenuItem value="stripe">بطاقة الائتمان (Stripe)</MenuItem>
                  <MenuItem value="d17">D17 - تونس</MenuItem>
                  <MenuItem value="flouci">Flouci - تونس</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  ✓ دفع آمن ومشفر
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  ✓ يمكنك إلغاء الاشتراك في أي وقت
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                  ✓ استرداد كامل المبلغ خلال 14 يوم
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)} disabled={processing}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubscribe}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <PaymentIcon />}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            {processing ? 'جاري المعالجة...' : 'الدفع الآن'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
