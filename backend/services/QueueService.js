
const pool = require('../config/db');

class QueueService {
  async logTenderHistory(tenderHistoryData) {
    await pool.query(
      `INSERT INTO tender_history 
      (id, tender_id, user_id, action, previous_state, new_state, metadata, ip_address, user_agent) 
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        tenderHistoryData.tender_id,
        tenderHistoryData.user_id,
        tenderHistoryData.action,
        tenderHistoryData.previous_state,
        tenderHistoryData.new_state,
        JSON.stringify(tenderHistoryData.metadata || {}),
        tenderHistoryData.ip_address,
        tenderHistoryData.user_agent
      ]
    );
  }

  async getTenderHistory(tenderId) {
    const result = await pool.query(
      `SELECT th.*, u.full_name as user_name 
       FROM tender_history th 
       LEFT JOIN users u ON th.user_id = u.id 
       WHERE th.tender_id = $1 
       ORDER BY th.created_at DESC`,
      [tenderId]
    );
    return result.rows;
  }
}

module.exports = new QueueService();
