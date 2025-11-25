const { getPool } = require('../config/db');
const AuditLogService = require('./AuditLogService');
const DataMapper = require('../helpers/DataMapper');

class ReviewService {
    async createReview(reviewData, buyerId, ipAddress) {
        const pool = getPool();
        
        // Map frontend data to database schema
        const mappedData = DataMapper.mapReview(reviewData);
        const { offer_id, supplier_id, rating, comment, po_id } = mappedData;

        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        try {
            // تحقق من أن PO قد انتهى
            const poResult = await pool.query(
                'SELECT status FROM purchase_orders WHERE id = $1 AND supplier_id = $2',
                [po_id, supplier_id]
            );

            if (!poResult.rows[0]) {
                throw new Error('Purchase order not found');
            }

            if (!['completed', 'paid'].includes(poResult.rows[0].status)) {
                throw new Error('Can only review after PO is completed or paid');
            }

            const result = await pool.query(
                `INSERT INTO reviews (offer_id, reviewer_id, reviewee_id, rating, comment, 
                 po_id, is_verified, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [offer_id, buyerId, supplier_id, rating, comment, po_id]
            );

            await AuditLogService.log(buyerId, 'review', result.rows[0].id, 'create', 
                `Supplier rated: ${rating}/5`, { ip_address: ipAddress });

            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create review: ${error.message}`);
        }
    }

    async getSupplierReviews(supplierId) {
        const pool = getPool();

        try {
            const result = await pool.query(
                `SELECT r.*, u.username as reviewer_name 
                 FROM reviews r 
                 JOIN users u ON r.reviewer_id = u.id 
                 WHERE r.reviewee_id = $1 AND r.is_verified = TRUE
                 ORDER BY r.created_at DESC`,
                [supplierId]
            );

            if (result.rows.length === 0) {
                return { average_rating: 0, total_reviews: 0, reviews: [] };
            }

            const avgRating = (result.rows.reduce((sum, r) => sum + r.rating, 0) / result.rows.length).toFixed(2);

            return {
                average_rating: parseFloat(avgRating),
                total_reviews: result.rows.length,
                reviews: result.rows
            };
        } catch (error) {
            throw new Error(`Failed to get supplier reviews: ${error.message}`);
        }
    }

    async updateSupplierAverageRating(supplierId) {
        const pool = getPool();

        try {
            const result = await pool.query(
                `SELECT AVG(rating)::DECIMAL(3,2) as avg_rating 
                 FROM reviews WHERE reviewee_id = $1 AND is_verified = TRUE`,
                [supplierId]
            );

            const avgRating = result.rows[0]?.avg_rating || 0;

            await pool.query(
                'UPDATE users SET average_rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [avgRating, supplierId]
            );

            return avgRating;
        } catch (error) {
            throw new Error(`Failed to update supplier rating: ${error.message}`);
        }
    }
}

module.exports = new ReviewService();
