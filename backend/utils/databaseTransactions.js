/**
 * 💳 DATABASE TRANSACTIONS
 * Safe, atomic database operations with rollback support
 */

const { getPool } = require('../config/db');

/**
 * Execute operations in a database transaction
 * If any operation fails, all are rolled back
 * 
 * @param {Function} callback - Async function with pool client
 * @returns {Promise} Result from callback
 * 
 * Usage:
 * const result = await withTransaction(async (client) => {
 *   await client.query('UPDATE users SET active=true WHERE id=$1', [userId]);
 *   await client.query('INSERT INTO audit_log ...');
 *   return { success: true };
 * });
 */
async function withTransaction(callback) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Execute callback operations
    const result = await callback(client);

    // Commit if successful
    await client.query('COMMIT');

    return result;
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Always release client
    client.release();
  }
}

/**
 * Multiple transactions in sequence
 */
async function withMultipleTransactions(callbacks) {
  const results = [];

  for (const callback of callbacks) {
    const result = await withTransaction(callback);
    results.push(result);
  }

  return results;
}

/**
 * Save point for nested transactions
 */
async function withSavePoint(client, name, callback) {
  try {
    await client.query(`SAVEPOINT ${name}`);
    const result = await callback(client);
    await client.query(`RELEASE SAVEPOINT ${name}`);
    return result;
  } catch (error) {
    await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
    throw error;
  }
}

/**
 * Example usage patterns
 */
const examples = {
  // Create tender with requirements in one atomic operation
  createTenderWithRequirements: async (tenderData, requirementsData) => {
    return withTransaction(async (client) => {
      // Create tender
      const tenderResult = await client.query(
        `INSERT INTO tenders (title, description, budget, deadline) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [tenderData.title, tenderData.description, tenderData.budget, tenderData.deadline]
      );

      const tenderId = tenderResult.rows[0].id;

      // Create requirements (must succeed with tender or both rollback)
      for (const req of requirementsData) {
        await client.query(
          `INSERT INTO tender_requirements (tender_id, requirement) 
           VALUES ($1, $2)`,
          [tenderId, req]
        );
      }

      return { tenderId, requirementCount: requirementsData.length };
    });
  },

  // Transfer data between tables atomically
  transferBidToAwarded: async (bidId) => {
    return withTransaction(async (client) => {
      // Get bid data
      const bidResult = await client.query('SELECT * FROM bids WHERE id=$1', [bidId]);
      if (bidResult.rows.length === 0) throw new Error('Bid not found');

      const bid = bidResult.rows[0];

      // Insert to awarded_bids
      await client.query(
        `INSERT INTO awarded_bids (bid_id, tender_id, amount, awarded_date) 
         VALUES ($1, $2, $3, NOW())`,
        [bidId, bid.tender_id, bid.amount]
      );

      // Update bid status
      await client.query('UPDATE bids SET status=$1 WHERE id=$2', ['awarded', bidId]);

      // Update tender status
      await client.query('UPDATE tenders SET status=$1 WHERE id=$2', ['awarded', bid.tender_id]);

      return { success: true };
    });
  },

  // Multi-step invoice creation
  createInvoiceWithAudit: async (invoiceData, userId) => {
    return withTransaction(async (client) => {
      // Create invoice
      const invResult = await client.query(
        `INSERT INTO invoices (tender_id, amount, due_date, status) 
         VALUES ($1, $2, $3, 'pending') RETURNING id`,
        [invoiceData.tender_id, invoiceData.amount, invoiceData.due_date]
      );

      const invoiceId = invResult.rows[0].id;

      // Log action
      await client.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id) 
         VALUES ($1, 'CREATE', 'invoice', $2)`,
        [userId, invoiceId]
      );

      // Update tender invoice count
      await client.query(
        `UPDATE tenders SET invoice_count = invoice_count + 1 WHERE id=$1`,
        [invoiceData.tender_id]
      );

      return invoiceId;
    });
  }
};

module.exports = {
  withTransaction,
  withMultipleTransactions,
  withSavePoint,
  examples
};
