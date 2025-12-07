
require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const logger = console;

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

async function startServer() {
  try {
    console.log('========================================');
    console.log('MyNet.tn Backend Server Starting...');
    console.log('========================================');

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
    app.use('/api/procurement/clarifications', clarificationRoutes);
    app.use('/api/auth/password-reset', passwordResetRoutes);

    // Start server
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log('✅ Using SimpleAuthService for authentication');
      console.log('========================================');
      console.log('Available endpoints:');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('  - GET  /api/procurement/tenders');
      console.log('========================================');
      console.log('📧 Test Accounts:');
      console.log('  Buyer: buyer@mynet.tn / buyer123');
      console.log('  Supplier: supplier@mynet.tn / supplier123');
      console.log('  Admin: admin@mynet.tn / admin123');
      console.log('========================================');
    });

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', { message: error.message });
    console.error(error);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', { error: error.message });
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection:', { reason: String(reason) });
  console.error(reason);
  process.exit(1);
});

// Start the server
startServer();
