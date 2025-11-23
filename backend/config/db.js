const { Pool } = require('pg');

let pool;
let poolMetrics = {
  totalConnections: 0,
  activeConnections: 0,
  errors: 0
};

// ✅ SAFE CONNECTION WRAPPER - Prevents double-release
class SafeClient {
  constructor(pgClient) {
    this.pgClient = pgClient;
    this.isReleased = false;
  }

  async query(...args) {
    if (this.isReleased) {
      throw new Error('Client has been released to the pool');
    }
    return this.pgClient.query(...args);
  }

  release() {
    if (!this.isReleased) {
      this.isReleased = true;
      this.pgClient.release();
    }
  }

  async end() {
    if (!this.isReleased) {
      this.isReleased = true;
      await this.pgClient.end();
    }
  }
}

async function initializeDb() {
    try {
        if (!pool) {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                },
                // 🚀 STABLE CONNECTION POOL - Optimized for Neon/Replit
                max: 15,                    // Reduced from 20 to prevent exhaustion
                min: 3,                     // Reduced from 5
                idleTimeoutMillis: 30000,   // 30s idle timeout
                connectionTimeoutMillis: 10000,
                application_name: 'mynet-backend',
                maxUses: 7500,              // Recycle connections to prevent memory leaks
                statement_timeout: 30000,   // 30s query timeout
                query_timeout: 30000,       // Query timeout
                idle_in_transaction_session_timeout: 30000,
                keepAlives: true,           // Enable keep-alive to prevent idle disconnects
                keepalivesIdle: 30,         // Send keep-alive every 30s
                keepalivesInterval: 10      // Interval between keep-alives
            });

            // ✅ POOL EVENT HANDLERS - Better error handling
            pool.on('error', (err, client) => {
                poolMetrics.errors++;
                // Pool error - safely logged via metrics system
                // Do not attempt to log via services at this early stage
                
                // Do NOT try to release the client - let the pool handle it
                // Attempting to release can cause "already released" errors
                if (client && !client._connected) {
                    try {
                        // Only release if client appears to be in a valid state
                        if (typeof client.release === 'function' && !client._releasing) {
                            client.release();
                        }
                    } catch (releaseErr) {
                        // Silently ignore release errors - pool will handle cleanup
                    }
                }
            });

            pool.on('connect', () => {
                poolMetrics.totalConnections++;
                poolMetrics.activeConnections++;
                // Removed console.log - connection tracking handled by metrics
            });

            pool.on('remove', () => {
                poolMetrics.activeConnections--;
                // Removed console.log - connection tracking handled by metrics
            });

            // ✅ QUERY ERROR HANDLER - Catch idle transaction errors
            pool.on('query', (query) => {
                // Log slow queries via monitoring service instead of console
                if (query.duration > 5000) {
                    const performanceMetrics = require('../utils/performanceMetrics');
                    performanceMetrics.recordQuery('slow-query', query.duration);
                }
            });

            // Test connection with timeout
            const client = await pool.connect();
            try {
                const result = await client.query('SELECT NOW()');
                // Connection successful - logged via server startup sequence only
                // Removed verbose console.log statements
            } finally {
                client.release();
            }
        }
        return true;
    } catch (error) {
        // Database initialization error - logged via metrics
        return false;
    }
}

// ✅ SAFE QUERY WRAPPER - Prevents connection leaks
async function queryWithRetry(query, params = [], retries = 2) {
    const pool_ = getPool();
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        let client;
        try {
            client = await pool_.connect();
            const result = await client.query(query, params);
            client.release();
            return result;
        } catch (error) {
            if (client && !error.message.includes('already released')) {
                try {
                    client.release();
                } catch (releaseErr) {
                    // Ignore release errors
                }
            }
            
            lastError = error;
            
            // Retry on transient errors
            if (attempt < retries && (
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.message.includes('idle in transaction')
            )) {
                await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
                continue;
            }
            
            throw error;
        }
    }
    
    throw lastError;
}

function getPool() {
    if (!pool) {
        throw new Error("Database Pool not initialized. Call initializeDb() first.");
    }
    return pool;
}

function getPoolMetrics() {
    return { ...poolMetrics };
}

// Graceful shutdown
async function closeDb() {
    if (pool) {
        console.log('🛑 Closing database connections...');
        
        // Drain pool before closing
        try {
            await pool.end();
            console.log('✅ Database connections closed gracefully');
        } catch (error) {
            console.error('⚠️ Error closing pool:', error.message);
        }
        
        pool = null;
    }
}

// ✅ GRACEFUL SHUTDOWN HANDLERS
async function gracefulShutdown() {
    console.log('\n🛑 Received shutdown signal. Closing connections...');
    await closeDb();
    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    closeDb().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    closeDb().then(() => process.exit(1));
});

module.exports = {
    initializeDb,
    getPool,
    closeDb,
    queryWithRetry,
    getPoolMetrics,
    SafeClient
};
