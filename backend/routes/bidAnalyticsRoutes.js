// Bid Analytics - OPTIMIZED
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const QueryOptimizer = require('../utils/queryOptimizer');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const router = express.Router();

// Get bid statistics for a tender (optimized + cached)
router.get('/tender/:tenderId', authMiddleware, cacheMiddleware(600), async (req, res) => {
  try {
    const { tenderId } = req.params;
    const db = req.app.get('db');

    const stats = await QueryOptimizer.getBidAnalytics(db, tenderId);
    res.json(stats.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bid distribution (price ranges)
router.get('/distribution/:tenderId', authMiddleware, async (req, res) => {
  try {
    const { tenderId } = req.params;
    const db = req.app.get('db');

    const distribution = await db.query(`
      SELECT
        CASE 
          WHEN price < 10000 THEN 'Under 10k'
          WHEN price < 50000 THEN '10k-50k'
          WHEN price < 100000 THEN '50k-100k'
          ELSE 'Over 100k'
        END as price_range,
        COUNT(*) as count
      FROM offers
      WHERE tender_id = $1 AND is_deleted = false
      GROUP BY price_range
      ORDER BY price_range
    `, [tenderId]);

    res.json(distribution.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare bids
router.get('/compare/:tenderId', authMiddleware, async (req, res) => {
  try {
    const { tenderId } = req.params;
    const db = req.app.get('db');

    const comparison = await db.query(`
      SELECT 
        o.id,
        o.price,
        o.delivery_days,
        o.status,
        u.company_name,
        u.average_rating,
        u.verified
      FROM offers o
      LEFT JOIN users u ON o.supplier_id = u.id
      WHERE o.tender_id = $1 AND o.is_deleted = false
      ORDER BY o.price ASC
    `, [tenderId]);

    res.json(comparison.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
