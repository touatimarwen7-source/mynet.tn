const schedule = require('node-schedule');
const { getPool } = require('../config/db');
const OpeningReportService = require('../services/OpeningReportService');

/**
 * Tender Auto-Close Job
 * Automatically closes expired tenders and generates opening reports
 */
class TenderAutoCloseJob {
  static async runAutoCloseJob() {
    const startTime = Date.now();
    console.log('🕐 [TenderAutoCloseJob] Running tender auto-close check...');
    
    let closedCount = 0;
    let errorCount = 0;

    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, tender_number, title, deadline, buyer_id 
         FROM tenders 
         WHERE status = 'published' 
         AND deadline < NOW() 
         AND is_deleted = FALSE 
         ORDER BY deadline ASC
         LIMIT 100`
      );

      if (!result || !result.rows || result.rows.length === 0) {
        console.log('✅ [TenderAutoCloseJob] No tenders to close');
        return;
      }

      console.log(`📋 [TenderAutoCloseJob] Found ${result.rows.length} tender(s) to close`);

      for (const tender of result.rows) {
        if (!tender || !tender.id) {
          console.warn('⚠️  [TenderAutoCloseJob] Skipping invalid tender object');
          continue;
        }

        try {
          const pool = getPool();
          const offersResult = await pool.query(
            `SELECT * FROM offers 
             WHERE tender_id = $1 
             AND status IN ('submitted', 'received')
             AND is_deleted = FALSE`,
            [tender.id]
          );

          const offers = (offersResult && offersResult.rows) || [];
          console.log(`   - Tender #${tender.tender_number}: ${offers.length} offer(s) found`);

          await OpeningReportService.createOpeningReport(
            tender.id,
            offers,
            tender.buyer_id
          );

          await pool.query(
            `UPDATE tenders 
             SET status = 'closed', updated_at = NOW() 
             WHERE id = $1`,
            [tender.id]
          );

          console.log(`   ✅ Tender #${tender.tender_number} closed successfully`);
          closedCount++;
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Error closing tender #${tender.tender_number}:`, error.message);
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ [TenderAutoCloseJob] Completed: ${closedCount} closed, ${errorCount} errors in ${duration}s`);
    } catch (error) {
      console.error('❌ [TenderAutoCloseJob] Fatal error:', error.message);
    }
  }

  /**
   * Schedule the auto-close job to run every 60 seconds
   * @returns {Object} Scheduled job object
   */
  static scheduleJob() {
    console.log('🔄 [TenderAutoCloseJob] Scheduling job to run every 60 seconds...');
    
    try {
      const job = schedule.scheduleJob('*/1 * * * *', async () => {
        await this.runAutoCloseJob();
      });
      
      console.log('✅ [TenderAutoCloseJob] Job scheduled successfully');
      return job;
    } catch (error) {
      console.error('❌ [TenderAutoCloseJob] Failed to schedule job:', error.message);
      throw error;
    }
  }
}

module.exports = TenderAutoCloseJob;
