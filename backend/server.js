require('dotenv').config();
const app = require('./app');
const { initializeDb } = require('./config/db');
const { initializeSchema } = require('./config/schema');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('========================================');
        console.log('MyNet.tn Backend Server Starting...');
        console.log('========================================');

        const dbConnected = await initializeDb();
        
        if (dbConnected) {
            const pool = getPool();
            await initializeSchema(pool);
            console.log('✅ Database initialized successfully');
        } else {
            console.warn('⚠️  Server starting without database connection');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log('========================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Access API at: http://localhost:${PORT}`);
            console.log('========================================');
            console.log('Available endpoints:');
            console.log('  - POST /api/auth/register');
            console.log('  - POST /api/auth/login');
            console.log('  - GET  /api/procurement/tenders');
            console.log('  - POST /api/procurement/tenders');
            console.log('  - POST /api/procurement/offers');
            console.log('  - GET  /api/admin/statistics');
            console.log('  - GET  /api/search/tenders');
            console.log('========================================');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
