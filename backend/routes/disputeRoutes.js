
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all disputes
 * GET /api/disputes
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT d.*, 
        po.order_number,
        b.company_name as buyer_name,
        s.company_name as supplier_name
       FROM disputes d
       JOIN purchase_orders po ON d.purchase_order_id = po.id
       JOIN users b ON po.buyer_id = b.id
       JOIN users s ON po.supplier_id = s.id
       WHERE d.raised_by = $1 OR po.buyer_id = $1 OR po.supplier_id = $1
       ORDER BY d.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      disputes: result.rows
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create dispute
 * POST /api/disputes
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { purchaseOrderId, type, description, evidence } = req.body;
    const pool = getPool();

    // Validation
    if (!purchaseOrderId || !type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const validTypes = ['quality', 'delivery_delay', 'non_receipt', 'payment_issue', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dispute type'
      });
    }

    // Verify purchase order access
    const poCheck = await pool.query(
      'SELECT * FROM purchase_orders WHERE id = $1 AND (buyer_id = $2 OR supplier_id = $2)',
      [purchaseOrderId, req.user.id]
    );

    if (poCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found or access denied'
      });
    }

    const result = await pool.query(
      `INSERT INTO disputes 
        (purchase_order_id, raised_by, type, description, evidence, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [purchaseOrderId, req.user.id, type, description, evidence]
    );

    res.status(201).json({
      success: true,
      message: 'Dispute raised successfully',
      dispute: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating dispute:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get dispute details
 * GET /api/disputes/:id
 */
router.get('/:id', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `SELECT d.*, 
        po.order_number,
        b.company_name as buyer_name,
        s.company_name as supplier_name,
        u.company_name as raised_by_name
       FROM disputes d
       JOIN purchase_orders po ON d.purchase_order_id = po.id
       JOIN users b ON po.buyer_id = b.id
       JOIN users s ON po.supplier_id = s.id
       JOIN users u ON d.raised_by = u.id
       WHERE d.id = $1 AND (d.raised_by = $2 OR po.buyer_id = $2 OR po.supplier_id = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dispute not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      dispute: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching dispute:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update dispute status
 * PATCH /api/disputes/:id/status
 */
router.patch('/:id/status', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const pool = getPool();

    const validStatuses = ['open', 'investigating', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const result = await pool.query(
      `UPDATE disputes d
       SET status = $1,
           resolution = COALESCE($2, resolution),
           resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN CURRENT_TIMESTAMP ELSE resolved_at END,
           resolved_by = CASE WHEN $1 IN ('resolved', 'closed') THEN $3 ELSE resolved_by END
       FROM purchase_orders po
       WHERE d.id = $4 AND d.purchase_order_id = po.id 
         AND (po.buyer_id = $3 OR po.supplier_id = $3)
       RETURNING d.*`,
      [status, resolution, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dispute not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dispute status updated successfully',
      dispute: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating dispute status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Add comment to dispute
 * POST /api/disputes/:id/comments
 */
router.post('/:id/comments', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const pool = getPool();

    if (!comment) {
      return res.status(400).json({
        success: false,
        error: 'Comment is required'
      });
    }

    // Verify access
    const disputeCheck = await pool.query(
      `SELECT d.* FROM disputes d
       JOIN purchase_orders po ON d.purchase_order_id = po.id
       WHERE d.id = $1 AND (d.raised_by = $2 OR po.buyer_id = $2 OR po.supplier_id = $2)`,
      [id, req.user.id]
    );

    if (disputeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dispute not found or access denied'
      });
    }

    const result = await pool.query(
      `INSERT INTO dispute_comments (dispute_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: result.rows[0]
    });
  } catch (error) {
    logger.error('Error adding dispute comment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
