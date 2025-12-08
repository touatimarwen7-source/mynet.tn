// Analytics Dashboard Routes - OPTIMIZED
const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const QueryOptimizer = require('../utils/queryOptimizer');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Get dashboard statistics for buyers (optimized + cached)
router.get('/dashboard/buyer', verifyToken, cacheMiddleware({ ttl: 600 }), async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const result = await QueryOptimizer.getBuyerAnalytics(db, userId);
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics for suppliers (optimized + cached)
router.get(
  '/dashboard/supplier',
  verifyToken,
  cacheMiddleware({ ttl: 600 }),
  async (req, res) => {
    try {
      const db = req.app.get('db');
      const userId = req.user.id;

      const result = await QueryOptimizer.getSupplierAnalytics(db, userId);
      res.json(result.rows[0] || {});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get tender trends (last 30 days)
router.get('/trends/tenders', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const trends = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM tenders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND is_deleted = false
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json(trends.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get offer status distribution
router.get('/distribution/offers', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const distribution = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM offers 
      WHERE is_deleted = false
      GROUP BY status
    `);

    res.json(distribution.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category breakdown
router.get('/breakdown/categories', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const breakdown = await db.query(`
      SELECT 
        category,
        COUNT(*) as count,
        COALESCE(AVG((SELECT average_rating FROM users WHERE users.id = tenders.buyer_id)), 0) as avg_rating
      FROM tenders 
      WHERE is_deleted = false
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json(breakdown.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
