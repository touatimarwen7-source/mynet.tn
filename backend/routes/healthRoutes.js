const express = require('express');
const router = express.Router();
const { getPool, getPoolMetrics } = require('../config/db');
const { getCacheManager } = require('../utils/redisCache');
const { checkDatabaseHealth, performFullHealthCheck } = require('../utils/databaseHealthCheck');

/**
 * 🏥 نقطة نهاية فحص الصحة الشامل
 * GET /api/health
 */
router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    components: {}
  };

  try {
    // فحص قاعدة البيانات المتقدم
    const dbHealth = await checkDatabaseHealth();
    const poolMetrics = getPoolMetrics();

    healthStatus.components.database = {
      status: dbHealth.status,
      responseTime: dbHealth.responseTime,
      serverTime: dbHealth.serverTime,
      poolMetrics: {
        total: poolMetrics.totalConnections,
        active: poolMetrics.activeConnections,
        errors: poolMetrics.errors,
        idle: dbHealth.pool?.idle || 0,
        waiting: dbHealth.pool?.waiting || 0
      }
    };

    if (dbHealth.status !== 'healthy') {
      healthStatus.status = 'degraded';
    }
  } catch (dbError) {
    healthStatus.status = 'degraded';
    healthStatus.components.database = {
      status: 'unhealthy',
      error: dbError.message,
      code: dbError.code
    };
  }

  try {
    // فحص الكاش
    const cacheManager = getCacheManager();
    const cacheStats = cacheManager.getStats();

    healthStatus.components.cache = {
      status: 'healthy',
      stats: cacheStats
    };
  } catch (cacheError) {
    healthStatus.components.cache = {
      status: 'degraded',
      error: cacheError.message
    };
  }

  // تحديد رمز الحالة HTTP
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json(healthStatus);
});

/**
 * 🔍 فحص الجاهزية - للاستخدام مع Kubernetes/Docker
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

/**
 * 💓 فحص النشاط - للاستخدام مع Load Balancers
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true, uptime: process.uptime() });
});

/**
 * 🔍 فحص شامل للنظام - للمسؤولين فقط
 * GET /api/health/full
 */
router.get('/full', async (req, res) => {
  try {
    const fullCheck = await performFullHealthCheck();
    const statusCode = fullCheck.overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json(fullCheck);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to perform health check',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;