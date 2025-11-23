/**
 * 🛡️ SAFE QUERY MIDDLEWARE
 * Prevents connection leaks by wrapping pool queries
 * Ensures proper error handling and connection release
 */

const { getPool } = require('../config/db');

/**
 * Wrapper for pool.query() that ensures safe connection handling
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function safeQuery(query, params = []) {
  const pool = getPool();
  let client;
  
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    // Log error but don't crash
    // Error tracking removed;
    throw error;
  } finally {
    if (client) {
      try {
        // Safe release - check if client is valid before releasing
        if (typeof client.release === 'function') {
          client.release();
        }
      } catch (releaseErr) {
        // Silently ignore release errors
        console.debug('Release error (ignored):', releaseErr.message);
      }
    }
  }
}

/**
 * Augment pool object with safe methods
 * @param {Pool} pool - PostgreSQL pool instance
 */
function augmentPoolWithSafeMethods(pool) {
  // Store original query method
  const originalQuery = pool.query.bind(pool);
  
  // Override with safer version
  pool.query = async function(query, params) {
    try {
      // Use pool's built-in query which doesn't require explicit connection
      return await originalQuery(query, params);
    } catch (error) {
      // Error tracking removed;
      throw error;
    }
  };
  
  return pool;
}

/**
 * Middleware to attach safe query helper to request
 * Usage: app.use(safeQueryMiddleware)
 * Then: const result = await req.safeQuery(sql, params);
 */
function safeQueryMiddleware(req, res, next) {
  const pool = getPool();
  
  req.safeQuery = async (query, params = []) => {
    let client;
    
    try {
      client = await pool.connect();
      const result = await client.query(query, params);
      return result;
    } finally {
      if (client) {
        try {
          if (typeof client.release === 'function') {
            client.release();
          }
        } catch (err) {
          // Ignore release errors
        }
      }
    }
  };
  
  next();
}

module.exports = {
  safeQuery,
  augmentPoolWithSafeMethods,
  safeQueryMiddleware
};
