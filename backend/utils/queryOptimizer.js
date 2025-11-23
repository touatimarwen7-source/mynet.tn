/**
 * ⚡ QUERY OPTIMIZER
 * Combines complex subqueries into optimized single queries
 * Reduces database round trips and improves performance
 */

class QueryOptimizer {
  /**
   * Get buyer analytics with optimized query
   */
  static async getBuyerAnalytics(pool, userId) {
    const query = `
      WITH buyer_stats AS (
        SELECT
          COUNT(DISTINCT t.id) FILTER (WHERE t.is_deleted = false) as total_tenders,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'open' AND t.is_deleted = false) as active_tenders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.is_deleted = false) as total_offers_received,
          COUNT(DISTINCT po.id) FILTER (WHERE po.status = 'confirmed' AND po.is_deleted = false) as confirmed_orders,
          COALESCE(SUM(po.total_amount) FILTER (WHERE po.is_deleted = false), 0) as total_spending
        FROM tenders t
        LEFT JOIN offers o ON t.id = o.tender_id
        LEFT JOIN purchase_orders po ON t.id = po.tender_id
        WHERE t.buyer_id = $1
      ),
      supplier_ratings AS (
        SELECT AVG(u.average_rating) as avg_supplier_rating
        FROM users u
        WHERE u.id IN (
          SELECT DISTINCT o.supplier_id 
          FROM offers o 
          JOIN tenders t ON o.tender_id = t.id
          WHERE t.buyer_id = $1 AND o.is_deleted = false
        ) AND u.is_deleted = false
      )
      SELECT * FROM buyer_stats, supplier_ratings;
    `;
    
    return pool.query(query, [userId]);
  }

  /**
   * Get supplier analytics with optimized query
   */
  static async getSupplierAnalytics(pool, userId) {
    const query = `
      SELECT
        COUNT(DISTINCT id) FILTER (WHERE is_deleted = false) as total_offers_submitted,
        COUNT(DISTINCT id) FILTER (WHERE status = 'accepted' AND is_deleted = false) as accepted_offers,
        COUNT(DISTINCT po.id) FILTER (WHERE po.status = 'confirmed' AND po.is_deleted = false) as confirmed_orders,
        COALESCE(SUM(po.total_amount) FILTER (WHERE po.status = 'confirmed' AND po.is_deleted = false), 0) as total_revenue,
        COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false), 0) as total_reviews,
        COALESCE((SELECT average_rating FROM users WHERE id = $1), 0) as avg_rating
      FROM offers o
      LEFT JOIN purchase_orders po ON o.id = po.offer_id
      WHERE o.supplier_id = $1;
    `;
    
    return pool.query(query, [userId]);
  }

  /**
   * Get supplier performance with optimized query
   */
  static async getSupplierPerformance(pool, supplierId) {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'accepted' AND is_deleted = false) as completed_orders,
        COUNT(*) FILTER (WHERE is_deleted = false) as total_offers,
        (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND rating >= 4 AND is_deleted = false) as positive_reviews,
        (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = $1 AND is_deleted = false) as total_reviews,
        (SELECT verified FROM users WHERE id = $1) as verified,
        EXTRACT(EPOCH FROM (NOW() - (SELECT created_at FROM users WHERE id = $1))) / 86400 as days_active
      FROM offers
      WHERE supplier_id = $1;
    `;
    
    return pool.query(query, [supplierId]);
  }

  /**
   * Get bid analytics with optimized query
   */
  static async getBidAnalytics(pool, tenderId) {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE is_deleted = false) as total_bids,
        COUNT(*) FILTER (WHERE status = 'accepted' AND is_deleted = false) as accepted_bids,
        AVG(price) FILTER (WHERE is_deleted = false) as avg_bid_price,
        MIN(price) FILTER (WHERE is_deleted = false) as lowest_bid,
        MAX(price) FILTER (WHERE is_deleted = false) as highest_bid,
        AVG(u.average_rating) as avg_supplier_rating
      FROM offers o
      LEFT JOIN users u ON o.supplier_id = u.id
      WHERE o.tender_id = $1 AND o.is_deleted = false;
    `;
    
    return pool.query(query, [tenderId]);
  }
}

module.exports = QueryOptimizer;
