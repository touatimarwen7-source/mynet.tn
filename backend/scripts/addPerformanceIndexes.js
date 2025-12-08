
/**
 * 🚀 Performance Indexes Script
 * Adds database indexes for optimized query performance
 */

const { getPool } = require('../config/db');

async function addPerformanceIndexes() {
  const pool = getPool();

  console.log('🔧 Adding performance indexes...');

  try {
    // Tenders indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_search 
      ON tenders(is_deleted, is_public, status, created_at DESC);
    `);
    console.log('✅ Added tenders search index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_category 
      ON tenders(category) WHERE is_deleted = FALSE;
    `);
    console.log('✅ Added tenders category index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_budget 
      ON tenders(budget_min, budget_max) WHERE is_deleted = FALSE;
    `);
    console.log('✅ Added tenders budget index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_deadline 
      ON tenders(deadline) WHERE is_deleted = FALSE AND status IN ('open', 'published');
    `);
    console.log('✅ Added tenders deadline index');

    // Users/Suppliers indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_suppliers 
      ON users(role, is_active, is_deleted, average_rating DESC);
    `);
    console.log('✅ Added users suppliers index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company 
      ON users(company_name) WHERE role = 'supplier' AND is_deleted = FALSE;
    `);
    console.log('✅ Added users company name index');

    // Offers indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_tender 
      ON offers(tender_id, status) WHERE is_deleted = FALSE;
    `);
    console.log('✅ Added offers tender index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_supplier 
      ON offers(supplier_id, status, submitted_at DESC) WHERE is_deleted = FALSE;
    `);
    console.log('✅ Added offers supplier index');

    // Full-text search indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_fulltext 
      ON tenders USING gin(to_tsvector('english', title || ' ' || description));
    `);
    console.log('✅ Added tenders full-text search index');

    console.log('🎉 All performance indexes added successfully!');
  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addPerformanceIndexes()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = addPerformanceIndexes;
