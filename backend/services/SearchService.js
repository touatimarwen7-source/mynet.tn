const { getPool } = require('../config/db');

class SearchService {
  /**
   * Search tenders with flexible filtering by keyword, category, status, and budget
   * @async
   * @param {Object} searchParams - Search parameters
   * @param {string} [searchParams.keyword] - Search keyword (matches title/description)
   * @param {string} [searchParams.category] - Tender category filter
   * @param {string} [searchParams.status] - Tender status filter
   * @param {number} [searchParams.minBudget] - Minimum budget filter
   * @param {number} [searchParams.maxBudget] - Maximum budget filter
   * @param {number} [searchParams.limit] - Pagination limit
   * @param {number} [searchParams.offset] - Pagination offset
   * @returns {Promise<Array>} Array of matching tender records
   * @throws {Error} When search query fails
   */
  async searchTenders(searchParams) {
    const pool = getPool();
    
    // Optimized query with specific columns and better indexing
    let query = `
      SELECT 
        id, tender_number, title, category, status, 
        budget_min, budget_max, currency, deadline, 
        publish_date, created_at, buyer_id
      FROM tenders 
      WHERE is_deleted = FALSE AND is_public = TRUE
    `;
    
    const params = [];
    let paramCount = 1;

    if (searchParams.keyword) {
      // Use to_tsvector for better full-text search performance
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${searchParams.keyword}%`);
      paramCount++;
    }

    if (searchParams.category) {
      query += ` AND category = $${paramCount}`;
      params.push(searchParams.category);
      paramCount++;
    }

    if (searchParams.status) {
      query += ` AND status = $${paramCount}`;
      params.push(searchParams.status);
      paramCount++;
    }

    if (searchParams.minBudget) {
      query += ` AND budget_min >= $${paramCount}`;
      params.push(searchParams.minBudget);
      paramCount++;
    }

    if (searchParams.maxBudget) {
      query += ` AND budget_max <= $${paramCount}`;
      params.push(searchParams.maxBudget);
      paramCount++;
    }

    // Optimized ordering with index
    query += ' ORDER BY created_at DESC';

    if (searchParams.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(Math.min(searchParams.limit, 100)); // Cap at 100
      paramCount++;
    }

    if (searchParams.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(searchParams.offset);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Search suppliers with keyword and verification filter
   * @async
   * @param {Object} searchParams - Search parameters
   * @param {string} [searchParams.keyword] - Search keyword (matches company_name/full_name)
   * @param {boolean} [searchParams.verified] - Filter to verified suppliers only
   * @returns {Promise<Array>} Array of matching supplier records
   * @throws {Error} When search query fails
   */
  async searchSuppliers(searchParams) {
    const pool = getPool();
    
    // Optimized query with specific columns and better performance
    let query = `
      SELECT 
        id, username, email, full_name, company_name, 
        company_registration, is_verified, average_rating, created_at
      FROM users 
      WHERE role = 'supplier' AND is_active = TRUE AND is_deleted = FALSE
    `;
    
    const params = [];
    let paramCount = 1;

    if (searchParams.keyword) {
      query += ` AND (company_name ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
      params.push(`%${searchParams.keyword}%`);
      paramCount++;
    }

    if (searchParams.verified) {
      query += ` AND is_verified = TRUE`;
    }

    if (searchParams.minRating) {
      query += ` AND average_rating >= $${paramCount}`;
      params.push(searchParams.minRating);
      paramCount++;
    }

    // Order by rating and creation date for better results
    query += ' ORDER BY average_rating DESC NULLS LAST, created_at DESC';

    // Add pagination
    if (searchParams.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(Math.min(searchParams.limit, 100));
      paramCount++;
    }

    if (searchParams.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(searchParams.offset);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Supplier search failed: ${error.message}`);
    }
  }

  /**
   * Get aggregate statistics across all tenders, offers, and users
   * Broken down by status and role
   * @async
   * @returns {Promise<Object>} Statistics object with tenders, offers, and users by status/role
   * @throws {Error} When database queries fail
   */
  async getStatistics() {
    const pool = getPool();

    try {
      const tenderStats = await pool.query(
        `SELECT status, COUNT(*) as count FROM tenders WHERE is_deleted = FALSE GROUP BY status`
      );

      const offerStats = await pool.query(
        `SELECT status, COUNT(*) as count FROM offers WHERE is_deleted = FALSE GROUP BY status`
      );

      const userStats = await pool.query(
        `SELECT role, COUNT(*) as count FROM users WHERE is_deleted = FALSE GROUP BY role`
      );

      return {
        tenders: tenderStats.rows,
        offers: offerStats.rows,
        users: userStats.rows,
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

module.exports = new SearchService();
