
const pool = require('../config/db');
const Review = require('../models/Review');

class ReviewService {
  async createReview(reviewData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify purchase order is completed
      const poCheck = await client.query(
        `SELECT * FROM purchase_orders 
         WHERE id = $1 AND status = 'completed' 
         AND (buyer_id = $2 OR supplier_id = $2)`,
        [reviewData.purchase_order_id, reviewData.reviewer_id]
      );

      if (poCheck.rows.length === 0) {
        throw new Error('Cannot review incomplete or unauthorized purchase order');
      }

      // Check if already reviewed
      const existingReview = await client.query(
        'SELECT * FROM reviews WHERE purchase_order_id = $1 AND reviewer_id = $2',
        [reviewData.purchase_order_id, reviewData.reviewer_id]
      );

      if (existingReview.rows.length > 0) {
        throw new Error('You have already reviewed this transaction');
      }

      const review = new Review({
        ...reviewData,
        is_verified: true // Auto-verify since PO is completed
      });

      const result = await client.query(
        `INSERT INTO reviews 
        (id, purchase_order_id, reviewer_id, reviewee_id, rating, comment, is_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [review.id, review.purchase_order_id, review.reviewer_id, 
         review.reviewee_id, review.rating, review.comment, review.is_verified]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserReviews(userId) {
    const result = await pool.query(
      `SELECT r.*, u.full_name as reviewer_name 
       FROM reviews r 
       JOIN users u ON r.reviewer_id = u.id 
       WHERE r.reviewee_id = $1 
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getUserRating(userId) {
    const result = await pool.query(
      `SELECT AVG(rating)::numeric(3,2) as average_rating, COUNT(*) as total_reviews 
       FROM reviews 
       WHERE reviewee_id = $1 AND is_verified = true`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = new ReviewService();
