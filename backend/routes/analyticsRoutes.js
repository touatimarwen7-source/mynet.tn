// Analytics Dashboard Routes - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get dashboard statistics for buyers
router.get('/dashboard/buyer', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM tenders WHERE buyer_id = $1 AND is_deleted = false) as total_tenders,
        (SELECT COUNT(*) FROM tenders WHERE buyer_id = $1 AND status = 'open' AND is_deleted = false) as active_tenders,
        (SELECT COUNT(*) FROM offers WHERE (SELECT buyer_id FROM tenders WHERE tenders.id = offers.tender_id) = $1 AND is_deleted = false) as total_offers_received,
        (SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = $1 AND status = 'confirmed' AND is_deleted = false) as confirmed_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE buyer_id = $1 AND is_deleted = false) as total_spending,
        (SELECT AVG(average_rating) FROM users WHERE id IN (SELECT supplier_id FROM offers WHERE (SELECT buyer_id FROM tenders WHERE tenders.id = offers.tender_id) = $1) AND is_deleted = false) as avg_supplier_rating
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics for suppliers
router.get('/dashboard/supplier', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = false) as total_offers_submitted,
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND status = 'accepted' AND is_deleted = false) as accepted_offers,
        (SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND status = 'confirmed' AND is_deleted = false) as confirmed_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE supplier_id = $1 AND status = 'confirmed' AND is_deleted = false) as total_revenue,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as total_reviews,
        (SELECT average_rating FROM users WHERE id = $1) as avg_rating
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tender trends (last 30 days)
router.get('/trends/tenders', authMiddleware, async (req, res) => {
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
router.get('/distribution/offers', authMiddleware, async (req, res) => {
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
router.get('/breakdown/categories', authMiddleware, async (req, res) => {
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
