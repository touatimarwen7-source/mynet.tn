const express = require('express');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

const router = express.Router();

/**
 * Log an action to audit logs (used internally by other modules)
 * @param {Object} db - Database connection pool
 * @param {number} userId - User ID performing the action
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity affected
 * @param {number} entityId - ID of entity affected
 * @param {Object} details - Additional details about the action
 */
const logAction = async (db, userId, action, entityType, entityId, details = {}) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (error) {
    // Silently fail - don't block main operations if audit logging fails
    console.error('Audit log error:', error);
  }
};

// Get audit logs (admin only)
/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs (admin only)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { entity_type, user_id } = req.query;
  const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
  const db = req.app.get('db');

    // Check if super_admin only
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows[0].role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (entity_type) {
      query += ` AND entity_type = $${params.length + 1}`;
      params.push(entity_type);
    }

    if (user_id) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(user_id);
    }

    query += ` ORDER BY created_at DESC ${sql}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  })
);

/**
 * Get user activity logs
 * @param {string} userId - User ID to get activity for
 * @returns {Object[]} Array of audit log entries
 */
router.get(
  '/user/:userId',
  validateIdMiddleware('userId'),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT * FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      ${sql}
      `,
      [userId, limit, offset]
    );

    return sendOk(res, result.rows, 'User activity logs retrieved successfully');
  })
);

    res.json(result.rows);
  })
);

// Get specific audit log
router.get('/:id', validateIdMiddleware('id'), authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = req.app.get('db');

    const result = await db.query('SELECT * FROM audit_logs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    // Check if the user has permission to view this log (e.g., admin or the user who performed the action)
    const log = result.rows[0];
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    const userRole = userResult.rows[0].role;

    if (userRole !== 'super_admin' && log.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(log);
  })
);

// Export logs helper
router.logAction = logAction;

module.exports = router;