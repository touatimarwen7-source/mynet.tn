// Supplier Performance Tracking - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get supplier performance score
router.get('/supplier/:supplierId', authMiddleware, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const db = req.app.get('db');

    const performance = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND status = 'accepted' AND is_deleted = false) as completed_orders,
        (SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = false) as total_offers,
        (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND rating >= 4 AND is_deleted = false) as positive_reviews,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as total_reviews,
        (SELECT verified FROM users WHERE id = $1) as verified,
        (SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 FROM users WHERE id = $1) as days_active
    `, [supplierId]);

    if (performance.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const perf = performance.rows[0];
    const completionRate = (perf.completed_orders / perf.total_offers) * 100 || 0;
    const ratingScore = (perf.avg_rating * 20) || 0;
    const reviewScore = (perf.positive_reviews / perf.total_reviews) * 100 || 0;

    const overallScore = (completionRate * 0.4 + ratingScore * 0.4 + reviewScore * 0.2);

    res.json({
      ...perf,
      completion_rate: parseFloat(completionRate.toFixed(2)),
      rating_score: parseFloat(ratingScore.toFixed(2)),
      review_score: parseFloat(reviewScore.toFixed(2)),
      overall_score: parseFloat(overallScore.toFixed(2)),
      performance_tier: overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Fair'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top suppliers by performance
router.get('/top-suppliers', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');

    const topSuppliers = await db.query(`
      SELECT 
        u.id,
        u.company_name,
        u.average_rating,
        (SELECT COUNT(*) FROM offers WHERE supplier_id = u.id AND is_deleted = false) as total_offers,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = u.id AND is_deleted = false) as review_count,
        u.verified
      FROM users u
      WHERE u.role = 'supplier' AND u.is_deleted = false
      ORDER BY u.average_rating DESC, review_count DESC
      LIMIT 10
    `);

    res.json(topSuppliers.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier performance history
router.get('/history/:supplierId', authMiddleware, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const db = req.app.get('db');

    const history = await db.query(`
      SELECT 
        o.id,
        o.price,
        o.status,
        o.created_at,
        (SELECT title FROM tenders WHERE id = o.tender_id) as tender_title,
        (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1 AND created_at <= o.created_at AND is_deleted = false) as rating_at_time
      FROM offers o
      WHERE o.supplier_id = $1 AND o.is_deleted = false
      ORDER BY o.created_at DESC
      LIMIT 50
    `, [supplierId]);

    res.json(history.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
