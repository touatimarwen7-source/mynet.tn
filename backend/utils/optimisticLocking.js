/**
 * ⚡ OPTIMISTIC LOCKING
 * Prevent concurrent update conflicts with version tracking
 * 
 * Pattern: Each record has a version number
 * When updating, check version matches before updating
 * If version changed, someone else modified it - fail and retry
 */

const { getPool } = require('../config/db');

/**
 * Add version column to table (run once during migration)
 * ALTER TABLE table_name ADD COLUMN version INTEGER DEFAULT 1;
 */

/**
 * Safe update with optimistic locking
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @param {number} currentVersion - Current version from client
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated record or null if version mismatch
 */
async function optimisticUpdate(table, id, currentVersion, updates) {
  const pool = getPool();

  // Build update query
  const setClause = Object.keys(updates)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  const nextVersion = currentVersion + 1;
  const params = [...Object.values(updates), nextVersion, id, currentVersion];

  try {
    const result = await pool.query(
      `UPDATE ${table} 
       SET ${setClause}, version = $${Object.keys(updates).length + 1}, updated_at = NOW()
       WHERE id = $${Object.keys(updates).length + 2} AND version = $${Object.keys(updates).length + 3}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      // Version mismatch - someone else updated the record
      return {
        success: false,
        reason: 'VERSION_CONFLICT',
        message: 'Record was modified by someone else. Please refresh and try again.'
      };
    }

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Retry logic for optimistic locking
 */
async function updateWithRetry(
  table,
  id,
  updateFn,
  maxRetries = 3
) {
  const pool = getPool();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get current record with version
      const currentResult = await pool.query(
        `SELECT * FROM ${table} WHERE id = $1`,
        [id]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Record not found');
      }

      const record = currentResult.rows[0];
      const updates = updateFn(record); // Client provides update logic

      // Try optimistic update
      const result = await optimisticUpdate(
        table,
        id,
        record.version,
        updates
      );

      if (result.success) {
        return result.data;
      }

      // Version conflict, retry
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
        continue;
      }

      // Max retries exceeded
      throw new Error('UPDATE_FAILED_MAX_RETRIES: ' + result.message);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
}

/**
 * Usage Examples
 */
const examples = {
  // Update tender budget safely
  updateTenderBudget: async (tenderId, clientVersion, newBudget) => {
    return optimisticUpdate('tenders', tenderId, clientVersion, {
      budget: newBudget,
      updated_by: 'user_id'
    });
  },

  // Update invoice status with retry
  updateInvoiceStatus: async (invoiceId, statusFn) => {
    return updateWithRetry('invoices', invoiceId, (currentRecord) => ({
      status: statusFn(currentRecord.status),
      last_status_change: new Date().toISOString()
    }), 3);
  },

  // Increment counter atomically
  incrementBidCount: async (tenderId) => {
    return updateWithRetry('tenders', tenderId, (currentRecord) => ({
      bid_count: currentRecord.bid_count + 1
    }), 3);
  },

  // Multi-field update with conflict detection
  updateSupplierInfo: async (supplierId, clientVersion, updateData) => {
    const result = await optimisticUpdate(
      'companies',
      supplierId,
      clientVersion,
      {
        company_name: updateData.name,
        contact_email: updateData.email,
        phone: updateData.phone
      }
    );

    if (!result.success) {
      // Return version conflict error with current data for user to merge
      const pool = getPool();
      const current = await pool.query(
        'SELECT * FROM companies WHERE id = $1',
        [supplierId]
      );
      return {
        success: false,
        reason: 'VERSION_CONFLICT',
        currentData: current.rows[0],
        message: 'Your changes conflicted with another user. Review and reapply if needed.'
      };
    }

    return result;
  }
};

module.exports = {
  optimisticUpdate,
  updateWithRetry,
  examples
};
