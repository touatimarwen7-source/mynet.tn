
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all deliveries
 * GET /api/deliveries
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'buyer') {
      query = `
        SELECT d.*, po.order_number, u.company_name as supplier_name
        FROM deliveries d
        JOIN purchase_orders po ON d.purchase_order_id = po.id
        JOIN users u ON po.supplier_id = u.id
        WHERE po.buyer_id = $1
        ORDER BY d.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'supplier') {
      query = `
        SELECT d.*, po.order_number, u.company_name as buyer_name
        FROM deliveries d
        JOIN purchase_orders po ON d.purchase_order_id = po.id
        JOIN users u ON po.buyer_id = u.id
        WHERE po.supplier_id = $1
        ORDER BY d.created_at DESC
      `;
      params = [userId];
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      deliveries: result.rows
    });
  } catch (error) {
    logger.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create delivery
 * POST /api/deliveries
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { purchaseOrderId, scheduledDate, location, notes } = req.body;
    const pool = getPool();

    // Verify purchase order exists and user is supplier
    const poCheck = await pool.query(
      'SELECT * FROM purchase_orders WHERE id = $1 AND supplier_id = $2',
      [purchaseOrderId, req.user.id]
    );

    if (poCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found or access denied'
      });
    }

    const result = await pool.query(
      `INSERT INTO deliveries 
        (purchase_order_id, scheduled_date, location, notes, status, tracking_number)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [purchaseOrderId, scheduledDate, location, notes, `TRK-${Date.now()}`]
    );

    res.status(201).json({
      success: true,
      message: 'Delivery scheduled successfully',
      delivery: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating delivery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update delivery status
 * PATCH /api/deliveries/:id/status
 */
router.patch('/:id/status', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const pool = getPool();

    const validStatuses = ['pending', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const result = await pool.query(
      `UPDATE deliveries d
       SET status = $1,
           notes = COALESCE($2, notes),
           delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
       FROM purchase_orders po
       WHERE d.id = $3 AND d.purchase_order_id = po.id 
         AND (po.buyer_id = $4 OR po.supplier_id = $4)
       RETURNING d.*`,
      [status, notes, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      delivery: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Track delivery
 * GET /api/deliveries/:id/track
 */
router.get('/:id/track', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `SELECT d.*, po.order_number
       FROM deliveries d
       JOIN purchase_orders po ON d.purchase_order_id = po.id
       WHERE d.id = $1 AND (po.buyer_id = $2 OR po.supplier_id = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      delivery: result.rows[0]
    });
  } catch (error) {
    logger.error('Error tracking delivery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
