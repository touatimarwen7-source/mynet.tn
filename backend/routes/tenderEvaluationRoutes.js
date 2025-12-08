
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get evaluation criteria for a tender
 * GET /api/tender-evaluation/:tenderId/criteria
 */
router.get(
  '/:tenderId/criteria',
  validateIdMiddleware('tenderId'),
  verifyToken,
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const pool = getPool();

      const result = await pool.query(
        `SELECT evaluation_criteria, evaluation_weights 
         FROM tenders 
         WHERE id = $1`,
        [tenderId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tender not found'
        });
      }

      res.status(200).json({
        success: true,
        criteria: result.rows[0].evaluation_criteria || {},
        weights: result.rows[0].evaluation_weights || {}
      });
    } catch (error) {
      logger.error('Error fetching evaluation criteria:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * Submit evaluation scores for offers
 * POST /api/tender-evaluation/:tenderId/evaluate
 */
router.post(
  '/:tenderId/evaluate',
  validateIdMiddleware('tenderId'),
  verifyToken,
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { evaluations } = req.body;
      const pool = getPool();

      // Verify tender ownership
      const tenderCheck = await pool.query(
        'SELECT buyer_id FROM tenders WHERE id = $1',
        [tenderId]
      );

      if (tenderCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tender not found'
        });
      }

      if (tenderCheck.rows[0].buyer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to evaluate this tender'
        });
      }

      // Update evaluation scores for each offer
      const updatedOffers = [];
      for (const evaluation of evaluations) {
        const { offerId, scores, totalScore, notes } = evaluation;

        const updateResult = await pool.query(
          `UPDATE offers 
           SET evaluation_scores = $1,
               evaluation_score = $2,
               evaluation_notes = $3,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4 AND tender_id = $5
           RETURNING *`,
          [JSON.stringify(scores), totalScore, notes, offerId, tenderId]
        );

        if (updateResult.rows.length > 0) {
          updatedOffers.push(updateResult.rows[0]);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Evaluations submitted successfully',
        evaluatedOffers: updatedOffers
      });
    } catch (error) {
      logger.error('Error submitting evaluations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * Get evaluation summary for a tender
 * GET /api/tender-evaluation/:tenderId/summary
 */
router.get(
  '/:tenderId/summary',
  validateIdMiddleware('tenderId'),
  verifyToken,
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const pool = getPool();

      const result = await pool.query(
        `SELECT 
          o.id,
          o.supplier_id,
          u.company_name as supplier_name,
          o.total_amount,
          o.evaluation_score,
          o.evaluation_scores,
          o.evaluation_notes
         FROM offers o
         JOIN users u ON o.supplier_id = u.id
         WHERE o.tender_id = $1 AND o.is_deleted = false
         ORDER BY o.evaluation_score DESC NULLS LAST`,
        [tenderId]
      );

      res.status(200).json({
        success: true,
        offers: result.rows
      });
    } catch (error) {
      logger.error('Error fetching evaluation summary:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
