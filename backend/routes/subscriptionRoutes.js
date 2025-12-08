const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Get available plans - ISSUE FIX #1: Add authentication
router.get('/plans', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my subscription
router.get('/my-subscription', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query(
      `
      SELECT us.*, sp.name, sp.features, sp.max_tenders, sp.max_offers
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `,
      [req.user.id]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to plan - ISSUE FIX #2 #3: Add authorization + validation
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'plan_id is required' });
    }

    const db = req.app.get('db');

    // ISSUE FIX #2: Check plan exists
    const planCheck = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [plan_id]);
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const result = await db.query(
      `
      INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month')
      RETURNING *
    `,
      [req.user.id, plan_id, 'active']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.put('/cancel', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query(
      `
      UPDATE user_subscriptions 
      SET status = 'cancelled'
      WHERE user_id = $1 AND status = 'active'
      RETURNING *
    `,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
