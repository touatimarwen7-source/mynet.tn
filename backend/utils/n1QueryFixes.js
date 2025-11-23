/**
 * N+1 Query Fixes - Applied Patterns
 * 
 * All queries in the system should follow these patterns
 */

// ❌ BEFORE: N+1 Pattern in auditLogsRoutes.js
const badAuditPattern = `
// BAD - N+1
const auditLogs = await db.query('SELECT * FROM audit_logs');
for (const log of auditLogs.rows) {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [log.user_id]);
  log.user = user.rows[0];
}
`;

// ✅ AFTER: Optimized with JOIN
const goodAuditPattern = `
// GOOD - Single query with JOIN
const result = await db.query(\`
  SELECT a.*, u.username, u.email, u.role
  FROM audit_logs a
  LEFT JOIN users u ON a.user_id = u.id
  ORDER BY a.created_at DESC
  LIMIT $1 OFFSET $2
\`, [limit, offset]);
`;

// ❌ BEFORE: N+1 in messagesRoutes.js
const badMessagesPattern = `
// BAD - N+1
const messages = await db.query('SELECT * FROM messages');
for (const msg of messages.rows) {
  const sender = await db.query('SELECT * FROM users WHERE id = $1', [msg.sender_id]);
  msg.sender = sender.rows[0];
}
`;

// ✅ AFTER: Optimized
const goodMessagesPattern = `
// GOOD
const result = await db.query(\`
  SELECT m.*, u.username, u.full_name
  FROM messages m
  LEFT JOIN users u ON m.sender_id = u.id
  ORDER BY m.created_at DESC
  LIMIT $1 OFFSET $2
\`, [limit, offset]);
`;

// ❌ BEFORE: N+1 in reviewsRoutes.js
const badReviewsPattern = `
// BAD - N+1
const reviews = await db.query('SELECT * FROM reviews');
for (const review of reviews.rows) {
  const reviewer = await db.query('SELECT * FROM users WHERE id = $1', [review.reviewer_id]);
  review.reviewer = reviewer.rows[0];
}
`;

// ✅ AFTER: Optimized
const goodReviewsPattern = `
// GOOD
const result = await db.query(\`
  SELECT r.*, u.username, u.full_name, u.company_name
  FROM reviews r
  LEFT JOIN users u ON r.reviewer_id = u.id
  ORDER BY r.created_at DESC
  LIMIT $1 OFFSET $2
\`, [limit, offset]);
`;

module.exports = {
  badAuditPattern,
  goodAuditPattern,
  badMessagesPattern,
  goodMessagesPattern,
  badReviewsPattern,
  goodReviewsPattern,
};
