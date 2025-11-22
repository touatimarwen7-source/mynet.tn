// Supplier Analytics Dashboard - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Supplier dashboard overview
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const overview = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = false) as total_offers,
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND status = 'accepted' AND is_deleted = false) as accepted_offers,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE supplier_id = $1 AND is_deleted = false) as total_value,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as review_count,
        (SELECT average_rating FROM users WHERE id = $1) as avg_rating
    `, [userId]);

    res.json(overview.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Offer acceptance rate
router.get('/acceptance-rate', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const rate = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND status = 'accepted' AND is_deleted = false)::float / 
        NULLIF((SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = false), 0) * 100 as acceptance_rate
    `, [userId]);

    res.json({ acceptance_rate: rate.rows[0].acceptance_rate || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revenue by month
router.get('/revenue-by-month', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const revenue = await db.query(`
      SELECT 
        DATE_TRUNC('month', po.created_at) as month,
        SUM(po.total_amount) as revenue
      FROM purchase_orders po
      WHERE po.supplier_id = $1 AND po.is_deleted = false
      GROUP BY DATE_TRUNC('month', po.created_at)
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);

    res.json(revenue.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent reviews
router.get('/recent-reviews', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const reviews = await db.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.company_name as reviewer_company
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewed_user_id = $1 AND r.is_deleted = false
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json(reviews.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
