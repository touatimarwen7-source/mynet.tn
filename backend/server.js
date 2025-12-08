
require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    console.log('========================================');
    console.log('MyNet.tn Backend Server Starting...');
    console.log('========================================');

    // Initialize database connection
    const { initializeDb } = require('./config/db');
    const dbInitialized = await initializeDb();
    
    if (!dbInitialized) {
      console.warn('⚠️ Database connection failed - running in limited mode');
    } else {
      console.log('✅ Database connected successfully');
    }

    // Import app after database initialization
    const app = require('./app');

    // Start server
    const httpServer = http.createServer(app);
    
    httpServer.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log('✅ Frontend accessible at http://0.0.0.0:5000');
      console.log('========================================');
      console.log('Available endpoints:');
      console.log('  - Health: GET /health');
      console.log('  - Auth: POST /api/auth/login');
      console.log('  - Tenders: GET /api/procurement/tenders');
      console.log('  - API Docs: GET /api-docs');
      console.log('========================================');
      console.log('📧 Default Test Accounts:');
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
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️ SIGTERM received, closing server...');
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', String(reason));
  process.exit(1);
});

// Start the server
startServer();
