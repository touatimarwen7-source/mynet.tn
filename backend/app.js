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
const tenderEvaluationRoutes = require('./routes/tenderEvaluationRoutes');
const tenderAwardingRoutes = require('./routes/tenderAwardingRoutes');
const contractRoutes = require('./routes/contractRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
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
try {
  const enhancedRateLimiting = require('./middleware/enhancedRateLimiting');
  
  // Validate module structure
  if (!enhancedRateLimiting || typeof enhancedRateLimiting !== 'object') {
    throw new Error('Invalid module structure');
  }

  // Apply general rate limiting (IP-based)
  if (enhancedRateLimiting.general && typeof enhancedRateLimiting.general === 'function') {
    app.use('/api/', enhancedRateLimiting.general);
    logger.info('✅ General rate limiting enabled');
  } else {
    logger.warn('⚠️ General rate limiter not available');
  }

  // Advanced rate limit middleware for tracking
  if (typeof enhancedRateLimiting.advancedRateLimitMiddleware === 'function') {
    app.use(enhancedRateLimiting.advancedRateLimitMiddleware);
    logger.info('✅ Advanced rate limiting tracking enabled');
  } else {
    logger.warn('⚠️ Advanced rate limit tracker not available');
  }
} catch (err) {
  logger.error('❌ Enhanced rate limiting initialization failed', { 
    error: err.message,
    stack: err.stack?.split('\n').slice(0, 3).join('\n')
  });
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

// TURN 3: NEW FEATURE ROUTES - WITH COMPREHENSIVE SAFETY CHECKS
const safeUseRoute = (path, route, name) => {
  // Validate route object
  if (!route) {
    logger.warn(`⚠️ ${name} routes: null/undefined`);
    return false;
  }

  // Check if it's a valid Express router or middleware function
  const isValidRouter = typeof route === 'function' || 
                       (typeof route === 'object' && typeof route.use === 'function');

  if (!isValidRouter) {
    logger.warn(`⚠️ ${name} routes: invalid export (not a router/middleware)`);
    return false;
  }

  try {
    app.use(path, route);
    logger.info(`✅ ${name} routes loaded successfully on ${path}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to load ${name} routes on ${path}`, { 
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    return false;
  }
};

// Load routes with comprehensive validation
const routesToLoad = [
  { path: '/api/analytics', routes: analyticsRoutes, name: 'Analytics' },
  { path: '/api/search/advanced', routes: advancedSearchRoutes, name: 'Advanced Search' },
  { path: '/api/export', routes: exportRoutes, name: 'Export' },
  { path: '/api/mfa', routes: mfaRoutes, name: 'MFA' },
  { path: '/api/supplier-analytics', routes: supplierAnalyticsRoutes, name: 'Supplier Analytics' },
  { path: '/api/bid-analytics', routes: bidAnalyticsRoutes, name: 'Bid Analytics' },
  { path: '/api/bid-comparison', routes: bidComparisonRoutes, name: 'Bid Comparison' },
  { path: '/api/performance-tracking', routes: performanceTrackingRoutes, name: 'Performance Tracking' },
  { path: '/api/notifications', routes: notificationRoutes, name: 'Notifications' },
  { path: '/api/email', routes: emailRoutes, name: 'Email' },
  { path: '/api/backups', routes: backupRoutes, name: 'Backup Management' },
  { path: '/api/auth/password-reset', routes: passwordResetRoutes, name: 'Password Reset' },
  { path: '/api/inquiries', routes: inquiryRoutes, name: 'Tender Inquiries' },
  { path: '/api/evaluation', routes: offerEvaluationRoutes, name: 'Offer Evaluation' },
  { path: '/api/tender-management', routes: tenderManagementRoutes, name: 'Tender Management' },
  { path: '/api/tender-evaluation', routes: tenderEvaluationRoutes, name: 'Tender Evaluation' },
  { path: '/api/tender-awarding', routes: tenderAwardingRoutes, name: 'Tender Awarding' },
  { path: '/api/contracts', routes: contractRoutes, name: 'Contracts' },
  { path: '/api/deliveries', routes: deliveryRoutes, name: 'Deliveries' },
  { path: '/api/disputes', routes: disputeRoutes, name: 'Disputes' },
];

// Load all routes with validation
let loadedRoutesCount = 0;
let failedRoutesCount = 0;

routesToLoad.forEach(({ path, routes, name }) => {
  if (routes && typeof routes === 'object') {
    try {
      safeUseRoute(path, routes, name);
      loadedRoutesCount++;
    } catch (error) {
      logger.error(`Failed to load ${name} routes`, { error: error.message, path });
      failedRoutesCount++;
    }
  } else {
    logger.warn(`⚠️ ${name} routes not available or invalid`);
    failedRoutesCount++;
  }
});

logger.info(`📊 Routes loaded: ${loadedRoutesCount}/${routesToLoad.length} (${failedRoutesCount} failed)`);

// 🤖 AI RECOMMENDATIONS & ADVANCED ANALYTICS ROUTES
try {
  const aiRecommendationsRoutes = require('./routes/aiRecommendationsRoutes');
  if (aiRecommendationsRoutes && typeof aiRecommendationsRoutes === 'object') safeUseRoute('/api/ai/recommendations', aiRecommendationsRoutes, 'AI Recommendations');
} catch (err) {
  logger.warn('AI recommendations routes not available');
}

// 🐌 SLOW ENDPOINT MONITORING - Track performance issues
try {
  const { slowEndpointMonitor } = require('./middleware/slowEndpointMonitor');
  if (slowEndpointMonitor && typeof slowEndpointMonitor === 'function') {
    app.use(slowEndpointMonitor());
  }
} catch (err) {
  logger.warn('Slow endpoint monitor not available');
}

// 📋 CLARIFICATION ROUTES (مسارات الاستفسارات)
try {
  const clarificationRoutes = require('./routes/clarificationRoutes');
  if (clarificationRoutes && typeof clarificationRoutes === 'object') safeUseRoute('/api/clarifications', clarificationRoutes, 'Clarifications');
} catch (err) {
  logger.warn('Clarification routes not available');
}

// 🏅 PARTIAL AWARDROUTES (مسارات الترسية الجزئية)
try {
  const partialAwardRoutes = require('./routes/partialAwardRoutes');
  if (partialAwardRoutes && typeof partialAwardRoutes === 'object') safeUseRoute('/api/partial-awards', partialAwardRoutes, 'Partial Awards');
} catch (err) {
  logger.warn('Partial award routes not available');
}

// ⚡ PERFORMANCE MONITORING ROUTES (مراقبة الأداء)
try {
  const performanceRoutes = require('./routes/performanceRoutes');
  if (performanceRoutes && typeof performanceRoutes === 'object') safeUseRoute('/api/performance', performanceRoutes, 'Performance Monitoring');
} catch (err) {
  logger.warn('Performance routes not available');
}

// 💾 CACHE MANAGEMENT ROUTES (إدارة الذاكرة المؤقتة)
try {
  const cachingRoutes = require('./routes/cachingRoutes');
  if (cachingRoutes && typeof cachingRoutes === 'object') safeUseRoute('/api/cache', cachingRoutes, 'Cache Management');
} catch (err) {
  logger.warn('Caching routes not available');
}

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