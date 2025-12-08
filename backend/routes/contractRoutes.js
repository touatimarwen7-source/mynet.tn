
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all contracts
 * GET /api/contracts
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
        SELECT c.*, u.company_name as supplier_name
        FROM contracts c
        JOIN users u ON c.supplier_id = u.id
        WHERE c.buyer_id = $1
        ORDER BY c.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'supplier') {
      query = `
        SELECT c.*, u.company_name as buyer_name
        FROM contracts c
        JOIN users u ON c.buyer_id = u.id
        WHERE c.supplier_id = $1
        ORDER BY c.created_at DESC
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
      contracts: result.rows
    });
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get contract by ID
 * GET /api/contracts/:id
 */
router.get('/:id', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `SELECT c.*, 
        b.company_name as buyer_name,
        s.company_name as supplier_name,
        t.title as tender_title
       FROM contracts c
       JOIN users b ON c.buyer_id = b.id
       JOIN users s ON c.supplier_id = s.id
       LEFT JOIN tenders t ON c.tender_id = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    const contract = result.rows[0];

    // Check access
    if (contract.buyer_id !== req.user.id && contract.supplier_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create contract from awarded tender
 * POST /api/contracts
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tenderId, supplierId, amount, terms, startDate, endDate } = req.body;
    const pool = getPool();

    // Validation
    if (!tenderId || !supplierId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify tender is awarded
    const tenderCheck = await pool.query(
      `SELECT t.*, o.id as offer_id 
       FROM tenders t
       JOIN offers o ON t.id = o.tender_id
       WHERE t.id = $1 AND t.buyer_id = $2 AND o.supplier_id = $3 AND o.is_winner = true`,
      [tenderId, req.user.id, supplierId]
    );

    if (tenderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid tender or not awarded to this supplier'
      });
    }

    // Generate contract number
    const contractNumber = `CNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await pool.query(
      `INSERT INTO contracts 
        (number, tender_id, buyer_id, supplier_id, amount, terms, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING *`,
      [contractNumber, tenderId, req.user.id, supplierId, amount, terms, startDate, endDate]
    );

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      contract: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Sign contract
 * PATCH /api/contracts/:id/sign
 */
router.patch('/:id/sign', validateIdMiddleware('id'), verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `UPDATE contracts 
       SET status = 'signed',
           signed_at = CURRENT_TIMESTAMP,
           signed_by = $1
       WHERE id = $2 AND (buyer_id = $1 OR supplier_id = $1)
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contract signed successfully',
      contract: result.rows[0]
    });
  } catch (error) {
    logger.error('Error signing contract:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
