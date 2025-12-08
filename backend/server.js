
require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces for external access

async function startServer() {
  try {
    // ✅ تنظيف المنفذ تلقائياً قبل التشغيل
    const { execSync } = require('child_process');
    try {
      execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
      console.log(`✅ Port ${PORT} cleaned successfully`);
    } catch (cleanError) {
      // تجاهل الخطأ إذا لم يكن هناك عملية تستخدم المنفذ
    }

    console.log('========================================');
    console.log('MyNet.tn Backend Server Starting...');
    console.log('========================================');

    // Bootstrap DI Container and Modules
    const { bootstrap } = require('./core/bootstrap');
    await bootstrap();

    // Initialize database connection
    const { initializeDb } = require('./config/db');
    const { checkDatabaseHealth } = require('./utils/databaseHealthCheck');
    
    const dbInitialized = await initializeDb();
    
    if (!dbInitialized) {
      console.warn('⚠️ Database connection failed - running in limited mode');
      console.warn('⚠️ Some features may not be available');
    } else {
      console.log('✅ Database connected successfully');
      
      // التحقق من صحة الاتصال
      try {
        const health = await checkDatabaseHealth();
        console.log(`✅ Database health: ${health.status}`);
        console.log(`✅ Response time: ${health.responseTime}`);
        console.log(`✅ Pool connections: ${health.pool?.total || 0} total, ${health.pool?.idle || 0} idle`);
      } catch (healthError) {
        console.warn('⚠️ Database health check failed:', healthError.message);
      }
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
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL: Failed to start server');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code || 'N/A');
    
    if (error.stack) {
      const stackLines = error.stack.split('\n');
      console.error('Error Location:', stackLines[1]?.trim() || 'Unknown');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Full Stack Trace:');
      console.error(error.stack);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('💡 Troubleshooting Tips:');
    console.error('  1. Check controller exports: ensure all methods are properly defined');
    console.error('  2. Verify database connection in .env file');
    console.error('  3. Check if all dependencies are installed: npm install');
    console.error('  4. Review route handlers for missing function references');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
