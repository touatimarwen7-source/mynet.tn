require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initializeDb, getPool } = require('./config/db');
const { initializeSchema } = require('./config/schema');
const BackupScheduler = require('./services/backup/BackupScheduler');
const { initializeWebSocket } = require('./config/websocket');
const { errorTracker } = require('./services/ErrorTrackingService');
const { initializeSentry } = require('./config/sentry');
const { logger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const directSupplyRoutes = require('./routes/directSupplyRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');
const clarificationRoutes = require('./routes/clarificationRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    logger.info('========================================');
    logger.info('MyNet.tn Backend Server Starting...');
    logger.info('========================================');

    // Initialize monitoring and error tracking
    initializeSentry(app);
    logger.info('✅ Error tracking initialized');

    const dbConnected = await initializeDb();

    if (dbConnected) {
      const pool = getPool();
      await initializeSchema(pool);
      logger.info('✅ Database initialized successfully');

      // 🔄 Initialize backup scheduler
      BackupScheduler.start();
    } else {
      logger.warn('⚠️  Server starting without database connection');
    }

    // ✨ Create HTTP server for WebSocket support
    const server = http.createServer(app);

    // 🔌 Initialize WebSocket
    const io = initializeWebSocket(server);
    logger.info('✅ WebSocket initialized');

    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/procurement', procurementRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/super-admin', superAdminRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/messages', messagesRoutes);
    app.use('/api/reviews', reviewsRoutes);
    app.use('/api/direct-supply', directSupplyRoutes);
    app.use('/api/company-profile', companyProfileRoutes);
    app.use('/api/procurement', clarificationRoutes);
    app.use('/api/auth/password-reset', passwordResetRoutes);


    server.listen(PORT, '0.0.0.0', () => {
      logger.info('========================================');
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Access API at: http://localhost:${PORT}`);
      logger.info(`🔌 WebSocket available at: ws://localhost:${PORT}`);
      logger.info('========================================');
      logger.info('Available endpoints:');
      logger.info('  - POST /api/auth/register');
      logger.info('  - POST /api/auth/login');
      logger.info('  - GET  /api/procurement/tenders');
      logger.info('  - POST /api/procurement/tenders');
      logger.info('  - POST /api/procurement/offers');
      logger.info('  - GET  /api/admin/statistics');
      logger.info('  - GET  /api/search/tenders');
      logger.info('========================================');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', { message: error.message });
    errorTracker.trackError(error, {
      severity: 'critical',
      context: 'server_startup',
    });
    process.exit(1);
  }
}

// 🔍 Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', { error: error.message });
  errorTracker.trackError(error, {
    severity: 'critical',
    context: 'uncaught_exception',
  });
  process.exit(1); // Exit the process if an uncaught exception occurs
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection:', { reason: String(reason) });
  errorTracker.trackError(new Error(String(reason)), {
    severity: 'critical',
    context: 'unhandled_rejection',
  });
  process.exit(1); // Exit the process if an unhandled rejection occurs
});

// 🚀 Start the server
startServer();