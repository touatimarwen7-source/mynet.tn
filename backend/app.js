const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const openingReportRoutes = require('./routes/openingReportRoutes');
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
// Purchase orders gérés via procurement workflow
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
const inquiryRoutes = require('./routes/inquiryRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const backupRoutes = require('./routes/backupRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const offerEvaluationRoutes = require('./routes/offerEvaluationRoutes');
const tenderManagementRoutes = require('./routes/tenderManagementRoutes');
const { ipMiddleware } = require('./middleware/ipMiddleware');
const { requestTimeout } = require('./middleware/timeoutMiddleware');
const { perUserLimiter, apiLimiters } = require('./middleware/perUserRateLimiting');
const { sqlInjectionDetector } = require('./middleware/sqlInjectionAudit');
const { logger } = require('./utils/logger');

let initializeEmailService;
try {
  initializeEmailService = require('./config/emailService').initializeEmailService;
} catch (e) {
  initializeEmailService = () => logger.warn('Email service optional');
}
const {
  requestLoggingMiddleware,
  errorLoggingMiddleware,
} = require('./middleware/requestLoggingMiddleware');
const {
  securityHeadersMiddleware,
  corsMiddleware,
} = require('./middleware/corsSecurityMiddleware');
const { inputSanitizationMiddleware } = require('./middleware/inputSanitizationMiddleware');
const {
  ddosProtectionMiddleware,
  authLimiter,
  uploadLimiter,
} = require('./middleware/ddosProtectionMiddleware');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const { versionMiddleware } = require('./config/apiVersion');
const {
  errorHandler: globalErrorHandler,
  notFoundHandler,
  asyncHandler,
} = require('./middleware/errorHandlingMiddleware');
const { safeQueryMiddleware } = require('./middleware/safeQueryMiddleware');
const { validationMiddleware } = require('./middleware/validationMiddleware');
const { attachValidators } = require('./middleware/endpointValidators');
const distributedCacheMiddleware = require('./middleware/distributedCacheMiddleware');
const { getCacheManager } = require('./utils/redisCache');
const { errorTracker } = require('./services/ErrorTrackingService');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { ErrorResponseFormatter } = require('./utils/errorHandler');
const ServiceValidator = require('./utils/serviceValidator');
const DatabaseErrorHandler = require('./utils/databaseErrorHandler');

const app = express();

// Use Helmet to set secure HTTP headers (including CSP, Frame-Options)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'http://localhost:3000',
          'http://localhost:5000',
          'https://*.replit.dev',
          'https://*.replit.dev:*',
          'ws://localhost:*',
          'ws://*.replit.dev:*',
          'wss://*.replit.dev:*',
          'wss:',
        ],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    frameguard: { action: 'sameorigin' },
  })
);

// Attach utility classes to app locals for use in routes
app.locals.ErrorResponseFormatter = ErrorResponseFormatter;
app.locals.ServiceValidator = ServiceValidator;
app.locals.DatabaseErrorHandler = DatabaseErrorHandler;

// ✅ CRITICAL FIX: Trust proxy for rate limiting & X-Forwarded-For headers
app.set('trust proxy', 1);

// ISSUE FIX #6: CORS & CSRF Protection (upgraded with enhanced security)
const rateLimit = require('express-rate-limit');

app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization middleware (XSS prevention)
app.use(inputSanitizationMiddleware);

// DDoS protection middleware (early in chain)
app.use(ddosProtectionMiddleware);

// Enhanced security headers middleware
app.use(securityHeadersMiddleware);

// Request/Response logging middleware
app.use(requestLoggingMiddleware);

// 🚀 ENHANCED RATE LIMITING with per-user + IP tracking
const enhancedRateLimiting = require('./middleware/enhancedRateLimiting');

// Apply enhanced rate limiting (only if it exists and is a function)
if (enhancedRateLimiting && typeof enhancedRateLimiting.general === 'function') {
  app.use('/api/', enhancedRateLimiting.general);
}

// Advanced rate limit middleware for tracking
if (enhancedRateLimiting && typeof enhancedRateLimiting.advancedRateLimitMiddleware === 'function') {
  app.use(enhancedRateLimiting.advancedRateLimitMiddleware);
}

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

// 🛡️ CRITICAL FIX #1: Safe database connection handling
app.use(safeQueryMiddleware);

// 🛡️ CRITICAL FIX #2: Comprehensive input validation (prevents SQL injection & XSS)
app.use(validationMiddleware);
app.use(attachValidators);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ✅ HEALTH CHECK ENDPOINTS (Public - No auth required)
const healthRoutes = require('./routes/healthRoutes');
app.use('/api/health', healthRoutes);

// Legacy health endpoint (backwards compatibility)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MyNet.tn API',
    version: '1.2.0',
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
      timestamp: new Date().toISOString(),
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
      features: '/api/admin/features',
    },
  });
});

// 📚 SWAGGER/OPENAPI DOCUMENTATION
app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MyNet.tn API Documentation',
  })
);

// API specification endpoint
app.get('/api-spec.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/opening-reports', openingReportRoutes);
// Admin & Super Admin
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin/features', featureFlagRoutes);

// User & Profile
app.use('/api/profile', profileRoutes);
app.use('/api/company-profile', companyProfileRoutes);

// Procurement & Supply
app.use('/api/direct-supply', directSupplyRoutes);

// Communication
app.use('/api/reviews', reviewsRoutes);
app.use('/api/messages', messagesRoutes);

// System
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tender-history', tenderHistoryRoutes);
app.use('/api/search', searchRoutes);

// Documents & Payments
app.use('/api/pdf', pdfRoutes);
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/webhooks', stripeWebhookRoutes);

// ISSUE FIX #9: Add comprehensive error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ISSUE FIX #9: Add logging via requestLoggingMiddleware (already active above)

module.exports = app;
module.exports.asyncHandler = asyncHandler;

// TURN 3: NEW FEATUREROUTES
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

// 📋 TENDER INQUIRIES & ADDENDA ROUTES
app.use('/api', inquiryRoutes);

// 📊 OFFER OPENING & EVALUATION ROUTES
app.use('/api/evaluation', offerEvaluationRoutes);

// 🏆 TENDER MANAGEMENT ROUTES (Awards, Archives, Cancellation)
app.use('/api/tender-management', tenderManagementRoutes);

// 🤖 AI RECOMMENDATIONS & ADVANCED ANALYTICS ROUTES
const aiRecommendationsRoutes = require('./routes/aiRecommendationsRoutes');
app.use('/api/ai/recommendations', aiRecommendationsRoutes);

// Initialize email service
initializeEmailService();

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
      uptime: process.uptime(),
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 RATE LIMIT MONITORING ENDPOINTS
app.get('/api/admin/rate-limit-stats', (req, res) => {
  try {
    if (enhancedRateLimiting && typeof enhancedRateLimiting.getRateLimitStats === 'function') {
      const stats = enhancedRateLimiting.getRateLimitStats();
      res.status(200).json({
        stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(200).json({
        stats: {},
        message: 'Rate limiting stats not available',
        timestamp: new Date().toISOString(),
      });
    }
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

    if (enhancedRateLimiting && typeof enhancedRateLimiting.resetLimits === 'function') {
      const key = `user:${userId}`;
      const reset = enhancedRateLimiting.resetLimits(key);

      res.status(200).json({
        message: reset ? 'Limits reset successfully' : 'User not found',
        userId,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(200).json({
        message: 'Rate limiting reset not available',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/rate-limit-clear', (req, res) => {
  try {
    if (enhancedRateLimiting && typeof enhancedRateLimiting.clearAllLimits === 'function') {
      enhancedRateLimiting.clearAllLimits();
      res.status(200).json({
        message: 'All rate limits cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(200).json({
        message: 'Rate limiting clear not available',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Tender Auto-Close Job ============
// Initialize on server startup (optional)
try {
  const TenderAutoCloseJob = require('./jobs/tenderAutoCloseJob');
  TenderAutoCloseJob.scheduleJob();
  logger.info('✅ Tender auto-close job initialized');
} catch (e) {
  logger.warn('⚠️ Tender auto-close job optional: ' + e.message);
}