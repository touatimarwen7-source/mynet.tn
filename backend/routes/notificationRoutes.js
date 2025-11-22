// Email Notifications & Real-time Updates - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create notification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipient_id, type, subject, message, related_entity_id } = req.body;
    const db = req.app.get('db');

    // Validate required fields
    if (!recipient_id || !type || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(`
      INSERT INTO notifications (
        recipient_id, type, subject, message, related_entity_id, is_read
      )
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `, [recipient_id, type, subject, message, related_entity_id || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { page = 1, limit = 20, unread_only = false } = req.query;
    
    const offset = (page - 1) * limit;
    const finalLimit = Math.min(limit, 100);

    let query = 'SELECT * FROM notifications WHERE recipient_id = $1';
    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ' AND is_read = false';
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(finalLimit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const db = req.app.get('db');

    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2',
      [notificationId, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
