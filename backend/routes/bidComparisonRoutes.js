// Advanced Bid Comparison Tool - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Compare multiple bids with detailed analysis
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { bidIds } = req.body; // Array of offer IDs
    
    if (!Array.isArray(bidIds) || bidIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 bids required for comparison' });
    }

    const db = req.app.get('db');
    const placeholders = bidIds.map((_, i) => `$${i + 1}`).join(',');

    const comparison = await db.query(`
      SELECT 
        o.id,
        o.price,
        o.delivery_days,
        o.terms,
        o.status,
        u.company_name,
        u.average_rating,
        u.verified,
        (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = u.id AND is_deleted = false) as avg_review_rating
      FROM offers o
      LEFT JOIN users u ON o.supplier_id = u.id
      WHERE o.id IN (${placeholders}) AND o.is_deleted = false
      ORDER BY o.price ASC
    `, bidIds);

    // Calculate comparison metrics
    const bids = comparison.rows;
    const lowestPrice = Math.min(...bids.map(b => b.price));
    const highestPrice = Math.max(...bids.map(b => b.price));
    const avgPrice = bids.reduce((sum, b) => sum + b.price, 0) / bids.length;

    const scoredBids = bids.map(bid => ({
      ...bid,
      price_score: ((highestPrice - bid.price) / (highestPrice - lowestPrice)) * 100,
      quality_score: (bid.average_rating * 20) || 0,
      overall_score: (((highestPrice - bid.price) / (highestPrice - lowestPrice)) * 100 * 0.6) + ((bid.average_rating * 20) * 0.4)
    }));

    res.json({
      comparison: scoredBids,
      summary: {
        lowest_price: lowestPrice,
        highest_price: highestPrice,
        avg_price: avgPrice,
        price_range: highestPrice - lowestPrice
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
