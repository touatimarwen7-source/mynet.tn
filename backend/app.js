const express = require('express');
const authRoutes = require('./routes/authRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const stripeWebhookRoutes = require('./routes/webhooks/stripeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const featureFlagRoutes = require('./routes/featureFlagRoutes');
const supplierFeatureRoutes = require('./routes/supplierFeatureRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');
const directSupplyRoutes = require('./routes/directSupplyRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const purchaseOrdersRoutes = require('./routes/purchaseOrdersRoutes');
const auditLogsRoutes = require('./routes/auditLogsRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const tenderHistoryRoutes = require('./routes/tenderHistoryRoutes');
const supplierFeaturesRoutes = require('./routes/supplierFeaturesRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const advancedSearchRoutes = require('./routes/advancedSearchRoutes');
const exportRoutes = require('./routes/exportRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const supplierAnalyticsRoutes = require('./routes/supplierAnalyticsRoutes');
const bidAnalyticsRoutes = require('./routes/bidAnalyticsRoutes');
const bidComparisonRoutes = require('./routes/bidComparisonRoutes');
const performanceTrackingRoutes = require('./routes/performanceTrackingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { ipMiddleware } = require('./middleware/ipMiddleware');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const ErrorHandler = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const { versionMiddleware } = require('./config/apiVersion');

const app = express();

// ISSUE FIX #6: CORS & CSRF Protection
const cors = require('cors');
const rateLimit = require('express-rate-limit');

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ISSUE FIX #6: Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ISSUE FIX #7: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

app.use(ipMiddleware);

// ENHANCEMENT: Add request ID tracking
app.use(requestIdMiddleware);

// ENHANCEMENT: Add performance monitoring
app.use(performanceMiddleware);

// ENHANCEMENT: Add API version headers
app.use(versionMiddleware);

// ISSUE FIX #9: Add logging middleware
app.use(loggingMiddleware);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Running',
        message: 'MyNet.tn Procurement & Tender Management System API',
        version: '1.2.0',
        endpoints: {
            auth: '/api/auth',
            procurement: '/api/procurement',
            admin: '/api/admin',
            search: '/api/search',
            messaging: '/api/messaging',
            documents: '/api/documents/pdf',
            features: '/api/admin/features'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/features', featureFlagRoutes);
app.use('/api/admin/supplier-features', supplierFeatureRoutes);
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/direct-supply', directSupplyRoutes);
app.use('/api/procurement/reviews', reviewsRoutes);
app.use('/api/messaging', messagesRoutes);
app.use('/api/procurement/purchase-orders', purchaseOrdersRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tender-history', tenderHistoryRoutes);
app.use('/api/supplier-features', supplierFeaturesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/documents/pdf', pdfRoutes);
app.use('/api/webhooks', stripeWebhookRoutes);

// ISSUE FIX #9: Add error handling middleware
app.use(ErrorHandler.notFound);
app.use((err, req, res, next) => ErrorHandler.handle(err, req, res, next));

module.exports = app;
// TURN 3: NEW FEATURE ROUTES
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search/advanced', advancedSearchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/supplier-analytics', supplierAnalyticsRoutes);
app.use('/api/bid-analytics', bidAnalyticsRoutes);
app.use('/api/bid-comparison', bidComparisonRoutes);
app.use('/api/performance-tracking', performanceTrackingRoutes);
app.use('/api/notifications', notificationRoutes);
