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
const cors = require('cors');

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
          'http://*:3000',
          'http://*:5000',
          'http://localhost:*',
          'http://0.0.0.0:*',
          'https://*.replit.dev',
          'https://*.replit.dev:*',
          'http://*.replit.dev',
          'http://*.replit.dev:*',
          'https://*.repl.co',
          'https://*.repl.co:*',
          'http://*.repl.co',
          'http://*.repl.co:*',
          'ws://*:*',
          'wss://*:*',
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

// CORS configuration with strict validation
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://mynet.tn',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        logger.warn('CORS rejected origin:', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  })
);

// CSRF Protection
const csrfProtection = require('./utils/csrfProtection');
app.use(csrfProtection);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// SQL Injection Prevention (before input sanitization)
const sqlInjectionPrevention = require('./middleware/sqlInjectionPrevention');
app.use(sqlInjectionPrevention);

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
const teamManagementRoutes = require('./routes/teamManagementRoutes');
const supplierTeamManagementRoutes = require('./routes/supplierTeamManagementRoutes');
app.use('/api/team-management', teamManagementRoutes);
app.use('/api/supplier-team-management', supplierTeamManagementRoutes);
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

// TURN 3: NEW FEATUREROUTES - WITH COMPREHENSIVE SAFETY CHECKS
const safeUseRoute = (path, route, name) => {
  if (route && (typeof route === 'function' || typeof route.use === 'function')) {
    try {
      app.use(path, route);
      logger.info(`✅ ${name} routes loaded`);
    } catch (error) {
      logger.error(`❌ Failed to load ${name} routes: ${error.message}`);
    }
  } else {
    logger.warn(`⚠️ ${name} routes not available (invalid export)`);
  }
};

// Only load routes if they are properly exported
if (analyticsRoutes && typeof analyticsRoutes === 'object') safeUseRoute('/api/analytics', analyticsRoutes, 'Analytics');
if (advancedSearchRoutes && typeof advancedSearchRoutes === 'object') safeUseRoute('/api/search/advanced', advancedSearchRoutes, 'Advanced Search');
if (exportRoutes && typeof exportRoutes === 'object') safeUseRoute('/api/export', exportRoutes, 'Export');
if (mfaRoutes && typeof mfaRoutes === 'object') safeUseRoute('/api/mfa', mfaRoutes, 'MFA');
if (supplierAnalyticsRoutes && typeof supplierAnalyticsRoutes === 'object') safeUseRoute('/api/supplier-analytics', supplierAnalyticsRoutes, 'Supplier Analytics');
if (bidAnalyticsRoutes && typeof bidAnalyticsRoutes === 'object') safeUseRoute('/api/bid-analytics', bidAnalyticsRoutes, 'Bid Analytics');
if (bidComparisonRoutes && typeof bidComparisonRoutes === 'object') safeUseRoute('/api/bid-comparison', bidComparisonRoutes, 'Bid Comparison');
if (performanceTrackingRoutes && typeof performanceTrackingRoutes === 'object') safeUseRoute('/api/performance-tracking', performanceTrackingRoutes, 'Performance Tracking');
if (notificationRoutes && typeof notificationRoutes === 'object') safeUseRoute('/api/notifications', notificationRoutes, 'Notifications');
if (emailRoutes && typeof emailRoutes === 'object') safeUseRoute('/api/email', emailRoutes, 'Email');
if (backupRoutes && typeof backupRoutes === 'object') safeUseRoute('/api/backups', backupRoutes, 'Backup Management');
if (passwordResetRoutes && typeof passwordResetRoutes === 'object') safeUseRoute('/api/auth/password-reset', passwordResetRoutes, 'Password Reset');
if (inquiryRoutes && typeof inquiryRoutes === 'object') safeUseRoute('/api/inquiries', inquiryRoutes, 'Tender Inquiries');
if (offerEvaluationRoutes && typeof offerEvaluationRoutes === 'object') safeUseRoute('/api/evaluation', offerEvaluationRoutes, 'Offer Evaluation');
if (tenderManagementRoutes && typeof tenderManagementRoutes === 'object') safeUseRoute('/api/tender-management', tenderManagementRoutes, 'Tender Management');

// 🤖 AI RECOMMENDATIONS & ADVANCED ANALYTICS ROUTES
const aiRecommendationsRoutes = require('./routes/aiRecommendationsRoutes');
if (aiRecommendationsRoutes && typeof aiRecommendationsRoutes === 'object') safeUseRoute('/api/ai/recommendations', aiRecommendationsRoutes, 'AI Recommendations');

// 🐌 SLOW ENDPOINT MONITORING - Track performance issues
const { slowEndpointMonitor } = require('./middleware/slowEndpointMonitor');
if (slowEndpointMonitor && typeof slowEndpointMonitor === 'function') {
  app.use(slowEndpointMonitor());
}

// 📋 CLARIFICATION ROUTES (مسارات الاستفسارات)
const clarificationRoutes = require('./routes/clarificationRoutes');
if (clarificationRoutes && typeof clarificationRoutes === 'object') safeUseRoute('/api/clarifications', clarificationRoutes, 'Clarifications');

// 🏅 PARTIAL AWARDROUTES (مسارات الترسية الجزئية)
const partialAwardRoutes = require('./routes/partialAwardRoutes');
if (partialAwardRoutes && typeof partialAwardRoutes === 'object') safeUseRoute('/api/partial-awards', partialAwardRoutes, 'Partial Awards');

// ⚡ PERFORMANCE MONITORING ROUTES (مراقبة الأداء)
const performanceRoutes = require('./routes/performanceRoutes');
if (performanceRoutes && typeof performanceRoutes === 'object') safeUseRoute('/api/performance', performanceRoutes, 'Performance Monitoring');

// 💾 CACHE MANAGEMENT ROUTES (إدارة الذاكرة المؤقتة)
const cachingRoutes = require('./routes/cachingRoutes');
if (cachingRoutes && typeof cachingRoutes === 'object') safeUseRoute('/api/cache', cachingRoutes, 'Cache Management');

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