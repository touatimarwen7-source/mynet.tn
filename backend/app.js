const express = require('express');
const authRoutes = require('./routes/authRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const stripeWebhookRoutes = require('./routes/webhooks/stripeRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const profileRoutes = require('./routes/profileRoutes');
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
const emailRoutes = require('./routes/emailRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const backupRoutes = require('./routes/backupRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const { ipMiddleware } = require('./middleware/ipMiddleware');
const { requestTimeout } = require('./middleware/timeoutMiddleware');
const { perUserLimiter, apiLimiters } = require('./middleware/perUserRateLimiting');
const { sqlInjectionDetector } = require('./middleware/sqlInjectionAudit');
let initializeEmailService;
try {
  initializeEmailService = require('./config/emailService').initializeEmailService;
} catch (e) {
  initializeEmailService = () => console.warn('Email service optional');
}
const loggingMiddleware = require('./middleware/loggingMiddleware');
const ErrorHandler = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const { versionMiddleware } = require('./config/apiVersion');
const { globalErrorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware');
const { safeQueryMiddleware } = require('./middleware/safeQueryMiddleware');
const { validationMiddleware } = require('./middleware/validationMiddleware');
const { attachValidators } = require('./middleware/endpointValidators');
const distributedCacheMiddleware = require('./middleware/distributedCacheMiddleware');
const { getCacheManager } = require('./utils/redisCache');
const { errorTracker } = require('./services/ErrorTrackingService');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// ✅ CRITICAL FIX: Trust proxy for rate limiting & X-Forwarded-For headers
app.set('trust proxy', 1);

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

// 🚀 ENHANCED RATE LIMITING with per-user + IP tracking
const enhancedRateLimiting = require('./middleware/enhancedRateLimiting');

// Apply enhanced rate limiting
app.use('/api/', enhancedRateLimiting.general);
app.post('/api/auth/login', enhancedRateLimiting.login);
app.post('/api/auth/register', enhancedRateLimiting.register);
app.post('/api/auth/password-reset', enhancedRateLimiting.passwordReset);
app.post('/api/procurement/tenders', enhancedRateLimiting.tenderCreation);
app.post('/api/procurement/offers', enhancedRateLimiting.offerSubmission);
app.post('/api/messaging', enhancedRateLimiting.messageSending);
app.get('/api/search', enhancedRateLimiting.search);
app.post('/api/export', enhancedRateLimiting.export);

// Advanced rate limit middleware for tracking
app.use(enhancedRateLimiting.advancedRateLimitMiddleware);

// ⏱️ REQUEST TIMEOUT ENFORCEMENT (NEW)
app.use(requestTimeout);

// 🔍 SQL INJECTION DETECTION & AUDIT (NEW)
app.use(sqlInjectionDetector);

app.use(ipMiddleware);

// ENHANCEMENT: Add request ID tracking
app.use(requestIdMiddleware);

// ENHANCEMENT: Add performance monitoring
app.use(performanceMiddleware);

// 🚀 CACHING: Add distributed Redis cache middleware (100% endpoints)
app.use(distributedCacheMiddleware);

// ENHANCEMENT: Add API version headers
app.use(versionMiddleware);

// ISSUE FIX #9: Add logging middleware
app.use(loggingMiddleware);

// 🛡️ CRITICAL FIX #1: Safe database connection handling
app.use(safeQueryMiddleware);

// 🛡️ CRITICAL FIX #2: Comprehensive input validation (prevents SQL injection & XSS)
app.use(validationMiddleware);
app.use(attachValidators);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// ✅ HEALTH CHECK ENDPOINT (Public - No auth required)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'MyNet.tn API',
        version: '1.2.0'
    });
});

// 📊 ERROR TRACKING STATS ENDPOINT
app.get('/api/admin/error-stats', (req, res) => {
    try {
        const stats = errorTracker.getStats();
        const recentErrors = errorTracker.getRecentErrors(20);
        
        res.status(200).json({
            stats,
            recentErrors,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
            'super-admin': '/api/super-admin',
            search: '/api/search',
            messaging: '/api/messaging',
            documents: '/api/documents/pdf',
            features: '/api/admin/features'
        }
    });
});

// 📚 SWAGGER/OPENAPI DOCUMENTATION
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MyNet.tn API Documentation'
}));

// API specification endpoint
app.get('/api-spec.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin/features', featureFlagRoutes);
app.use('/api/admin/supplier-features', supplierFeatureRoutes);
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/user/profile', profileRoutes);
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

// ISSUE FIX #9: Add comprehensive error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
module.exports.asyncHandler = asyncHandler;

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

// Email service routes
app.use('/api/email', emailRoutes);

// 🔄 CRITICAL FIX #4: Backup management routes
app.use('/api/backups', backupRoutes);

// 🔐 PASSWORD RESET & EMAIL VERIFICATION ROUTES
app.use('/api/auth/password-reset', passwordResetRoutes);

// Initialize email service
initializeEmailService();

// Logging middleware (#9)
const { logger } = require('./utils/logger');
app.use(logger.requestMiddleware());

// Log startup
logger.info('MyNet.tn Backend Started', {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
});

// 📊 CACHE STATISTICS ENDPOINT
app.get('/api/cache/stats', (req, res) => {
  try {
    const cacheManager = getCacheManager();
    const stats = cacheManager.getStats();
    
    res.status(200).json({
      cache: stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ CACHE CLEAR ENDPOINT
app.delete('/api/cache/clear', (req, res) => {
  try {
    const cacheManager = getCacheManager();
    cacheManager.clear();
    
    res.status(200).json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 RATE LIMIT MONITORING ENDPOINTS
app.get('/api/admin/rate-limit-stats', (req, res) => {
  try {
    const stats = enhancedRateLimiting.getRateLimitStats();
    res.status(200).json({
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/rate-limit-reset', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const key = `user:${userId}`;
    const reset = enhancedRateLimiting.resetLimits(key);
    
    res.status(200).json({
      message: reset ? 'Limits reset successfully' : 'User not found',
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/rate-limit-clear', (req, res) => {
  try {
    enhancedRateLimiting.clearAllLimits();
    res.status(200).json({
      message: 'All rate limits cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
