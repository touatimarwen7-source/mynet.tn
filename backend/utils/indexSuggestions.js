/**
 * 🔍 INDEX SUGGESTIONS
 * Database indexes to improve query performance
 * Run: npm run db:add-indexes
 */

const suggestedIndexes = [
  {
    table: 'tenders',
    columns: ['buyer_id', 'status'],
    reason: 'Speeds up buyer dashboard queries'
  },
  {
    table: 'tenders',
    columns: ['category', 'status'],
    reason: 'Improves category filtering'
  },
  {
    table: 'offers',
    columns: ['tender_id', 'status'],
    reason: 'Critical for bid analytics'
  },
  {
    table: 'offers',
    columns: ['supplier_id', 'status'],
    reason: 'Supplier dashboard performance'
  },
  {
    table: 'reviews',
    columns: ['reviewed_user_id'],
    reason: 'Rating calculations'
  },
  {
    table: 'messages',
    columns: ['sender_id', 'created_at'],
    reason: 'Message queries'
  },
  {
    table: 'messages',
    columns: ['recipient_id', 'read'],
    reason: 'Inbox queries'
  },
  {
    table: 'audit_logs',
    columns: ['user_id', 'created_at'],
    reason: 'Audit log searches'
  },
  {
    table: 'purchase_orders',
    columns: ['buyer_id', 'status'],
    reason: 'PO searches'
  },
  {
    table: 'purchase_orders',
    columns: ['supplier_id', 'status'],
    reason: 'Supplier PO queries'
  }
];

/**
 * Generate CREATE INDEX statements
 */
function generateIndexStatements() {
  return suggestedIndexes.map((idx, i) => {
    const indexName = `idx_${idx.table}_${idx.columns.join('_')}`;
    const columns = idx.columns.join(', ');
    return {
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName} ON ${idx.table} (${columns});`,
      name: indexName,
      reason: idx.reason
    };
  });
}

module.exports = {
  suggestedIndexes,
  generateIndexStatements
};
