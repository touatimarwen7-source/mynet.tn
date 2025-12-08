
/**
 * Database Health Check Utility
 * Verifies connection and performance
 */

const { getPool } = require('../config/db');

/**
 * Check database connection health
 */
async function checkDatabaseHealth() {
  const pool = getPool();
  const startTime = Date.now();
  
  try {
    // Simple connection test
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    const responseTime = Date.now() - startTime;
    
    // Check connection count
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      serverTime: result.rows[0].current_time,
      version: result.rows[0].version,
      pool: poolStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code,
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check core tables
 */
async function checkCoreTables() {
  const pool = getPool();
  const requiredTables = [
    'users',
    'tenders',
    'offers',
    'invoices',
    'purchase_orders',
    'audit_logs',
  ];
  
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name = ANY($1)
    `, [requiredTables]);
    
    const existingTables = result.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    return {
      status: missingTables.length === 0 ? 'complete' : 'incomplete',
      existing: existingTables,
      missing: missingTables,
      total: requiredTables.length,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Check indexes
 */
async function checkIndexes() {
  const pool = getPool();
  
  try {
    const result = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    return {
      status: 'ok',
      count: result.rows.length,
      indexes: result.rows,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Perform complete system health check
 */
async function performFullHealthCheck() {
  const [health, tables, indexes] = await Promise.all([
    checkDatabaseHealth(),
    checkCoreTables(),
    checkIndexes(),
  ]);
  
  return {
    database: health,
    tables,
    indexes: {
      count: indexes.count,
      status: indexes.status,
    },
    overall: health.status === 'healthy' && tables.status === 'complete' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  checkDatabaseHealth,
  checkCoreTables,
  checkIndexes,
  performFullHealthCheck,
};
