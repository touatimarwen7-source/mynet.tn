require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

async function startServer() {
  try {
    console.log('========================================');
    console.log('🚀 MyNet.tn Backend Starting...');
    console.log('========================================');

    // Bootstrap DI Container
    const { bootstrap } = require('./core/bootstrap');
    await bootstrap();
    console.log('✅ DI Container initialized');

    // Initialize database
    const { initializeDb } = require('./config/db');
    const dbInitialized = await initializeDb();

    if (!dbInitialized) {
      console.warn('⚠️ Database connection failed - running in limited mode');
    } else {
      console.log('✅ Database connected');

      try {
        const { checkDatabaseHealth } = require('./utils/databaseHealthCheck');
        const health = await checkDatabaseHealth();
        console.log(`✅ Database health: ${health.status}`);
      } catch (healthError) {
        console.warn('⚠️ Health check skipped');
      }
    }

    // Import app
    const app = require('./app');

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Enhanced server startup with error handling
    httpServer.listen(PORT, HOST, (err) => {
      if (err) {
        console.error('❌ Failed to start server', { error: err.message, stack: err.stack });
        process.exit(1);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 MyNet.tn Backend Server Started Successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Server Address: http://${HOST}:${PORT}`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error', { error: error.message, code: error.code });
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️ SIGTERM received, shutting down...');
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('⚠️ SIGINT received, shutting down...');
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL: Failed to start server');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);

    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', String(reason));
});

// Start
startServer();