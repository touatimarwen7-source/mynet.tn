const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

const router = express.Router();

// Helper function: Check for duplicate review
const checkDuplicateReview = async (db, reviewerId, reviewedUserId) => {
  try {
    const result = await db.query(
      'SELECT id FROM reviews WHERE reviewer_id = $1 AND reviewed_user_id = $2 AND is_deleted = false',
      [reviewerId, reviewedUserId]
    );
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
};

// Add a review - ISSUE FIX #3: Add input validation + duplicate check
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reviewed_user_id, tender_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    // ISSUE FIX #3: Comprehensive validation
    if (!reviewed_user_id) {
      return res.status(400).json({ error: 'reviewed_user_id is required' });
    }
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    if (comment.length > 5000) {
      return res.status(400).json({ error: 'Comment too long (max 5000 chars)' });
    }

    const db = req.app.get('db');

    // ENHANCEMENT: Check for duplicate review (same reviewer for same user)
    const isDuplicate = await checkDuplicateReview(db, reviewer_id, reviewed_user_id);
    if (isDuplicate) {
      return res.status(409).json({ error: 'You have already reviewed this user' });
    }

    // Insert review
    const result = await db.query(
      `
      INSERT INTO reviews (
        reviewer_id, reviewed_user_id, tender_id, rating, comment
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [reviewer_id, reviewed_user_id, tender_id, rating, comment]
    );

    // ISSUE FIX #8: Atomic transaction + exclude deleted reviews
    await db.query(
      `
      UPDATE users 
      SET average_rating = (
        SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false
      )
      WHERE id = $1
    `,
      [reviewed_user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a user - ISSUE FIX #1 #8: Add authentication + exclude deleted
router.get('/user/:userId', validateIdMiddleware('userId'), authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT 
        r.*,
        u.company_name as reviewer_company,
        u.full_name as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewed_user_id = $1 AND r.is_deleted = false
      ORDER BY r.created_at DESC
      LIMIT 50
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my reviews (as reviewed user) - ISSUE FIX #8: Exclude deleted reviews
router.get('/my-reviews', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT 
        r.*,
        u.company_name as reviewer_company,
        u.full_name as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewed_user_id = $1 AND r.is_deleted = false
      ORDER BY r.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my given reviews (as reviewer)
router.get('/my-given', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT 
        r.*,
        u.company_name as reviewed_company,
        u.average_rating as reviewed_current_rating
      FROM reviews r
      LEFT JOIN users u ON r.reviewed_user_id = u.id
      WHERE r.reviewer_id = $1
      ORDER BY r.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
router.put('/:reviewId', validateIdMiddleware('reviewId'), authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const db = req.app.get('db');

    // Check if review belongs to reviewer
    const checkResult = await db.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = checkResult.rows[0];
    if (review.reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      `
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `,
      [rating, comment, reviewId]
    );

    // Update user average rating
    await db.query(
      `
      UPDATE users 
      SET average_rating = (
        SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1
      )
      WHERE id = $1
    `,
      [review.reviewed_user_id]
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review - ISSUE FIX #5: Use soft delete + authorization
router.delete('/:reviewId', validateIdMiddleware('reviewId'), authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const db = req.app.get('db');

    const checkResult = await db.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = checkResult.rows[0];
    // ISSUE FIX #2: Add authorization check
    if (review.reviewer_id !== req.user.id && req.user.role !== 'super_admin') {
      return res
        .status(403)
        .json({ error: 'Unauthorized - only reviewer or super_admin can delete' });
    }

    // ISSUE FIX #5: Soft delete instead of hard delete
    await db.query('UPDATE reviews SET is_deleted = true WHERE id = $1', [reviewId]);

    // Update user average rating (exclude deleted reviews)
    await db.query(
      `
      UPDATE users 
      SET average_rating = (
        SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false
      )
      WHERE id = $1
    `,
      [review.reviewed_user_id]
    );

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;