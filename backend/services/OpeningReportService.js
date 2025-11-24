/**
 * Opening Report Service
 * Handles creation and retrieval of tender opening reports (procès-verbal)
 */

const { queryWithRetry, getPool } = require('../config/db');

class OpeningReportService {
  /**
   * Create opening report when tender closes
   * @param {number} tenderId - ID of the tender
   * @param {Array} offers - Array of offer objects
   * @param {number} userId - ID of the user creating the report
   * @throws {Error} If tender ID or offers array is invalid
   */
  static async createOpeningReport(tenderId, offers, userId) {
    try {
      if (!tenderId || !Array.isArray(offers)) {
        throw new Error('Invalid tender ID or offers data');
      }

      const validOffers = offers.filter(o => o && o.id);
      const totalValid = validOffers.filter(o => o.status === 'submitted' || o.status === 'received').length;

      const offersData = validOffers.map(offer => ({
        id: offer.id,
        supplier_name: offer.supplier_name || 'Unknown',
        supplier_id: offer.supplier_id,
        total_amount: offer.total_amount || 0,
        submitted_at: offer.submitted_at,
        status: offer.status,
        is_valid: offer.status === 'submitted' || offer.status === 'received'
      }));

      const pool = getPool();
      const report = await pool.query(
        `INSERT INTO opening_reports (
          tender_id, 
          opened_by, 
          total_offers_received,
          total_valid_offers,
          total_invalid_offers,
          offers_data,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [
          tenderId,
          userId,
          offersData.length,
          totalValid,
          offersData.length - totalValid,
          JSON.stringify(offersData),
          'open'
        ]
      );

      return report.rows[0];
    } catch (error) {
      console.error('Error creating opening report:', error);
      throw new Error(`Failed to create opening report: ${error.message}`);
    }
  }

  /**
   * Get opening report by tender ID
   * @param {number} tenderId - ID of the tender
   * @returns {Object|null} Opening report object or null if not found
   */
  static async getOpeningReportByTenderId(tenderId) {
    try {
      if (!tenderId) {
        throw new Error('Tender ID is required');
      }

      const pool = getPool();
      const result = await pool.query(
        `SELECT or.*, 
                t.title, 
                t.tender_number, 
                u.username as opened_by_name
         FROM opening_reports or
         LEFT JOIN tenders t ON or.tender_id = t.id
         LEFT JOIN users u ON or.opened_by = u.id
         WHERE or.tender_id = $1 
         ORDER BY or.opened_at DESC 
         LIMIT 1`,
        [tenderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const report = result.rows[0];
      report.offers_data = typeof report.offers_data === 'string' 
        ? JSON.parse(report.offers_data) 
        : (report.offers_data || []);

      return report;
    } catch (error) {
      console.error('Error fetching opening report:', error);
      throw new Error(`Failed to fetch opening report: ${error.message}`);
    }
  }

  /**
   * Get all opening reports for a buyer with pagination
   * @param {number} buyerId - ID of the buyer
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Array} Array of opening reports
   */
  static async getOpeningReportsByBuyer(buyerId, page = 1, limit = 10) {
    try {
      if (!buyerId) {
        throw new Error('Buyer ID is required');
      }

      const offset = (page - 1) * limit;

      const pool = getPool();
      const result = await pool.query(
        `SELECT or.*, 
                t.title, 
                t.tender_number, 
                u.username as opened_by_name
         FROM opening_reports or
         LEFT JOIN tenders t ON or.tender_id = t.id
         LEFT JOIN users u ON or.opened_by = u.id
         WHERE t.buyer_id = $1
         ORDER BY or.opened_at DESC
         LIMIT $2 OFFSET $3`,
        [buyerId, limit, offset]
      );

      return result.rows.map(report => ({
        ...report,
        offers_data: typeof report.offers_data === 'string' 
          ? JSON.parse(report.offers_data) 
          : (report.offers_data || [])
      }));
    } catch (error) {
      console.error('Error fetching opening reports:', error);
      throw new Error(`Failed to fetch opening reports: ${error.message}`);
    }
  }

  /**
   * Export opening report (PDF/JSON)
   * @param {number} reportId - ID of the report
   * @param {string} format - Export format: 'json' or 'pdf'
   * @returns {Object} Export data
   */
  static async exportOpeningReport(reportId, format = 'json') {
    try {
      if (!reportId) {
        throw new Error('Report ID is required');
      }

      const validFormats = ['json', 'pdf'];
      if (!validFormats.includes(format)) {
        throw new Error(`Invalid format. Supported: ${validFormats.join(', ')}`);
      }

      const pool = getPool();
      const result = await pool.query(
        `SELECT or.*, 
                t.title, 
                t.tender_number, 
                t.deadline, 
                t.budget_max,
                u.username as opened_by_name, 
                u.email as opened_by_email
         FROM opening_reports or
         LEFT JOIN tenders t ON or.tender_id = t.id
         LEFT JOIN users u ON or.opened_by = u.id
         WHERE or.id = $1`,
        [reportId]
      );

      if (result.rows.length === 0) {
        throw new Error('Opening report not found');
      }

      const report = result.rows[0];
      report.offers_data = typeof report.offers_data === 'string' 
        ? JSON.parse(report.offers_data) 
        : (report.offers_data || []);

      return {
        success: true,
        format,
        report,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting opening report:', error);
      throw new Error(`Failed to export opening report: ${error.message}`);
    }
  }
}

module.exports = OpeningReportService;
