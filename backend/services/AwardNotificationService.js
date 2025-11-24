/**
 * Award Notification Service
 */
const { getPool } = require('../config/db');
const { sendEmail } = require('../config/emailService');
const AuditLogService = require('./AuditLogService');

class AwardNotificationService {
  static async selectWinnersAndNotify(tenderId, winnersIds, buyerId) {
    const pool = getPool();
    try {
      const tenderResult = await pool.query(
        'SELECT * FROM tenders WHERE id = $1 AND buyer_id = $2',
        [tenderId, buyerId]
      );

      if (tenderResult.rows.length === 0) {
        throw new Error('Tender not found or access denied');
      }

      const tender = tenderResult.rows[0];

      // Validate partial award constraint
      if (!tender.allow_partial_award && winnersIds.length > 1) {
        throw new Error(`This tender allows only 1 winner (partial award disabled). You selected ${winnersIds.length} winners.`);
      }

      if (tender.max_winners && winnersIds.length > tender.max_winners) {
        throw new Error(`Maximum ${tender.max_winners} winner(s) allowed. You selected ${winnersIds.length}.`);
      }

      for (const winnerId of winnersIds) {
        await pool.query(
          'UPDATE offers SET award_status = $1, awarded_at = NOW() WHERE id = $2',
          ['awarded', winnerId]
        );
      }

      const participantsResult = await pool.query(
        `SELECT DISTINCT u.id, u.email, u.company_name, o.offer_number
         FROM offers o LEFT JOIN users u ON o.supplier_id = u.id
         WHERE o.tender_id = $1 AND o.status = 'submitted'`,
        [tenderId]
      );

      for (const participant of participantsResult.rows) {
        if (participant.email) {
          if (winnersIds.includes(participant.id)) {
            sendEmail(participant.email, `إخطار بالترسية - ${tender.tender_number}`, 
              `تم اختيارك كفائز في المناقصة`).catch(e => console.error('Email error:', e.message));
          } else {
            sendEmail(participant.email, `نتيجة المناقصة - ${tender.tender_number}`, 
              `للأسف لم يتم قبول عرضك`).catch(e => console.error('Email error:', e.message));
          }
        }
      }

      await AuditLogService.log(buyerId, 'award_selection', tenderId, 'create', 
        `${winnersIds.length} winner(s) selected and notifications sent`);

      return { success: true, winnersCount: winnersIds.length, notificationsCount: participantsResult.rows.length };
    } catch (error) {
      console.error('Error in winner selection:', error);
      throw error;
    }
  }

  static async getAwardStatus(tenderId) {
    const pool = getPool();
    const result = await pool.query(
      `SELECT o.id, o.offer_number, u.company_name, o.final_score, o.award_status, o.awarded_at, o.ranking
       FROM offers o LEFT JOIN users u ON o.supplier_id = u.id
       WHERE o.tender_id = $1 AND o.status = 'submitted' ORDER BY o.ranking ASC`,
      [tenderId]
    );
    return result.rows;
  }
}

module.exports = AwardNotificationService;
