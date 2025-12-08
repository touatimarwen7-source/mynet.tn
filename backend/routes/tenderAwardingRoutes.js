
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { getPool } = require('../config/db');
const NotificationService = require('../services/NotificationService');
const logger = require('../utils/logger');

/**
 * Get award candidates for a tender
 * GET /api/tender-awarding/:tenderId/candidates
 */
router.get(
  '/:tenderId/candidates',
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
          u.email as supplier_email,
          o.total_amount,
          o.delivery_time,
          o.evaluation_score,
          o.award_status,
          o.created_at
         FROM offers o
         JOIN users u ON o.supplier_id = u.id
         WHERE o.tender_id = $1 AND o.is_deleted = false
         ORDER BY o.evaluation_score DESC NULLS LAST`,
        [tenderId]
      );

      res.status(200).json({
        success: true,
        candidates: result.rows
      });
    } catch (error) {
      logger.error('Error fetching award candidates:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * Award tender to winner(s)
 * POST /api/tender-awarding/:tenderId/award
 */
router.post(
  '/:tenderId/award',
  validateIdMiddleware('tenderId'),
  verifyToken,
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { winnerId, awardAmount, awardNotes } = req.body;
      const pool = getPool();

      // Verify tender ownership
      const tenderCheck = await pool.query(
        'SELECT buyer_id, title FROM tenders WHERE id = $1',
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
          error: 'Not authorized to award this tender'
        });
      }

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update winner offer
        await client.query(
          `UPDATE offers 
           SET award_status = 'awarded',
               is_winner = true,
               award_amount = $1,
               award_notes = $2,
               award_date = CURRENT_TIMESTAMP
           WHERE id = $3 AND tender_id = $4`,
          [awardAmount, awardNotes, winnerId, tenderId]
        );

        // Update other offers as rejected
        await client.query(
          `UPDATE offers 
           SET award_status = 'rejected'
           WHERE tender_id = $1 AND id != $2 AND award_status = 'pending'`,
          [tenderId, winnerId]
        );

        // Update tender status
        await client.query(
          `UPDATE tenders 
           SET status = 'awarded',
               awarded_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [tenderId]
        );

        await client.query('COMMIT');

        // Get winner details for notification
        const winnerResult = await pool.query(
          `SELECT o.*, u.email, u.company_name 
           FROM offers o
           JOIN users u ON o.supplier_id = u.id
           WHERE o.id = $1`,
          [winnerId]
        );

        const winner = winnerResult.rows[0];

        // Send notification to winner
        await NotificationService.sendNotification({
          userId: winner.supplier_id,
          type: 'tender_awarded',
          title: 'Félicitations! Vous avez remporté l\'appel d\'offres',
          message: `Vous avez été sélectionné pour l'appel d'offres: ${tenderCheck.rows[0].title}`,
          relatedId: tenderId,
          relatedType: 'tender'
        });

        res.status(200).json({
          success: true,
          message: 'Tender awarded successfully',
          winner: {
            id: winner.id,
            supplier_name: winner.company_name,
            award_amount: awardAmount
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error awarding tender:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * Get award details
 * GET /api/tender-awarding/:tenderId/details
 */
router.get(
  '/:tenderId/details',
  validateIdMiddleware('tenderId'),
  verifyToken,
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const pool = getPool();

      const result = await pool.query(
        `SELECT 
          o.*,
          u.company_name as supplier_name,
          u.email as supplier_email,
          t.title as tender_title
         FROM offers o
         JOIN users u ON o.supplier_id = u.id
         JOIN tenders t ON o.tender_id = t.id
         WHERE o.tender_id = $1 AND o.is_winner = true`,
        [tenderId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No award found for this tender'
        });
      }

      res.status(200).json({
        success: true,
        award: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching award details:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
