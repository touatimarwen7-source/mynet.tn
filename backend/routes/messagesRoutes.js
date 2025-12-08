
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Send a message - ISSUE FIX #3: Add input validation
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { receiver_id, subject, content, related_entity_type, related_entity_id } = req.body;
  const sender_id = req.user.id;

  // ISSUE FIX #3: Comprehensive validation
  if (!receiver_id) {
    return res.status(400).json({ error: 'receiver_id is required' });
  }
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }
  if (content.length > 10000) {
    return res.status(400).json({ error: 'Message too long (max 10000 chars)' });
  }
  if (subject && subject.length > 255) {
    return res.status(400).json({ error: 'Subject too long (max 255 chars)' });
  }

  if (sender_id === parseInt(receiver_id)) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }

  const db = req.app.get('db');

  const result = await db.query(
    `
    INSERT INTO messages (
      sender_id, receiver_id, subject, content, related_entity_type, related_entity_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [
      sender_id,
      receiver_id,
      subject || null,
      content,
      related_entity_type || null,
      related_entity_id || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: result.rows[0],
  });
}));

// Get inbox (received messages)
router.get('/inbox', authMiddleware, asyncHandler(async (req, res) => {
  const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
  const db = req.app.get('db');
  const unread_only = req.query.unread_only;

  let query = `
    SELECT 
      m.*,
      u.company_name as sender_company,
      u.full_name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.receiver_id = $1
  `;
  const params = [req.user.id];

  if (unread_only === 'true') {
    query += ' AND m.is_read = false';
  }

  query += ` ORDER BY m.created_at DESC ${sql}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM messages WHERE receiver_id = $1';
  if (unread_only === 'true') {
    countQuery += ' AND is_read = false';
  }
  const countResult = await db.query(countQuery, [req.user.id]);

  res.json({
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(req.query.page || 1),
    limit: parseInt(req.query.limit || 10),
  });
}));

// Get sent messages
router.get('/sent', authMiddleware, asyncHandler(async (req, res) => {
  const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
  const db = req.app.get('db');

  const result = await db.query(
    `
    SELECT 
      m.*,
      u.company_name as receiver_company,
      u.full_name as receiver_name
    FROM messages m
    LEFT JOIN users u ON m.receiver_id = u.id
    WHERE m.sender_id = $1
    ORDER BY m.created_at DESC
    ${sql}
  `,
    [req.user.id, limit, offset]
  );

  const countResult = await db.query('SELECT COUNT(*) FROM messages WHERE sender_id = $1', [
    req.user.id,
  ]);

  res.json({
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(req.query.page || 1),
    limit: parseInt(req.query.limit || 10),
  });
}));

// Get single message
router.get('/:messageId', validateIdMiddleware('messageId'), authMiddleware, asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const db = req.app.get('db');

  // ISSUE FIX #8: Exclude deleted messages
  const result = await db.query(
    `
    SELECT 
      m.*,
      u.company_name as sender_company,
      u.full_name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.id = $1 AND (m.receiver_id = $2 OR m.sender_id = $2) AND m.is_deleted = false
  `,
    [messageId, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const message = result.rows[0];

  // Mark as read if receiver
  if (message.receiver_id === req.user.id && !message.is_read) {
    await db.query('UPDATE messages SET is_read = true WHERE id = $1', [messageId]);
    message.is_read = true;
  }

  res.json(message);
}));

// Mark as read
router.put(
  '/:messageId/read',
  validateIdMiddleware('messageId'),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const db = req.app.get('db');

    const checkResult = await db.query(
      'SELECT * FROM messages WHERE id = $1 AND is_deleted = false',
      [messageId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = checkResult.rows[0];
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // ISSUE FIX #8: Exclude deleted messages
    await db.query('UPDATE messages SET is_read = true WHERE id = $1 AND is_deleted = false', [
      messageId,
    ]);

    res.json({ success: true, message: 'Message marked as read' });
  })
);

// Get unread count
router.get('/count/unread', authMiddleware, asyncHandler(async (req, res) => {
  const db = req.app.get('db');

  // ISSUE FIX #8: Exclude deleted messages from unread count
  const result = await db.query(
    'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false AND is_deleted = false',
    [req.user.id]
  );

  res.json({ unread_count: parseInt(result.rows[0].count) });
}));

// Delete message - ISSUE FIX #2 #5: Add authorization + soft delete
router.delete(
  '/:messageId',
  validateIdMiddleware('messageId'),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const db = req.app.get('db');

    const checkResult = await db.query('SELECT * FROM messages WHERE id = $1', [messageId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = checkResult.rows[0];
    // ISSUE FIX #2: Authorization - only sender/receiver can delete
    if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized - cannot delete other users messages' });
    }

    // ISSUE FIX #5: Soft delete (preserve audit trail)
    await db.query('UPDATE messages SET is_deleted = true WHERE id = $1', [messageId]);

    res.json({ success: true, message: 'Message deleted' });
  })
);

module.exports = router;
