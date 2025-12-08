const { KeyManagementHelper } = require('../utils/keyManagementHelper');
const { Pool } = require('pg');

let pool;
let poolMetrics = {
  totalConnections: 0,
  activeConnections: 0,
  errors: 0,
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
    if (process.env.SKIP_DB_INIT === 'true') {
      console.log('⚠️  Database initialization skipped (SKIP_DB_INIT=true)');
      return false;
    }

    if (!pool) {
      const databaseUrl = KeyManagementHelper.getRequiredEnv('DATABASE_URL');
      
      // Use Neon connection pooler for pooled connections
      const pooledUrl = databaseUrl.includes('neon.tech') 
        ? databaseUrl.replace('.us-east-2', '-pooler.us-east-2')
        : databaseUrl;

      pool = new Pool({
        connectionString: pooledUrl,
        ssl: {
          rejectUnauthorized: false,
        },
        // 🚀 Optimized configuration for Neon PostgreSQL
        max: 10, // Reduce connections for Neon compatibility
        min: 2, // Lower minimum to save resources
        idleTimeoutMillis: 60000, // 60s idle timeout
        connectionTimeoutMillis: 10000, // 10s connection timeout
        application_name: 'mynet-backend-pro',
        maxUses: 7500,
        statement_timeout: 30000, // 30s query timeout
        query_timeout: 30000,
        idle_in_transaction_session_timeout: 60000, // 60s for transactions
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        allowExitOnIdle: false,
        log: (msg) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔵 Pool:', msg);
          }
        },
      });

      // ✅ POOL EVENT HANDLERS - معالجة أخطاء محسّنة
      pool.on('error', (err, client) => {
        poolMetrics.errors++;
        // Use logger instead of console to prevent credential leaks
        const logger = require('../utils/logger').logger;
        logger.error('Database pool error', {
          code: err.code,
          errno: err.errno,
          timestamp: new Date().toISOString()
          // Do NOT log err.message as it may contain connection strings
        });
        
        // Automatic reconnection for network errors
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
          console.log('🔄 Tentative de reconnexion...');
          setTimeout(() => {
            if (pool && pool.totalCount < pool.options.max) {
              pool.connect().catch(e => console.error('Reconnection failed:', e.message));
            }
          }, 5000);
        }
      });

      pool.on('connect', (client) => {
        poolMetrics.totalConnections++;
        poolMetrics.activeConnections++;
        
        // Set default timeout for each connection
        client.query('SET statement_timeout = 30000').catch(() => {});
      });

      pool.on('remove', () => {
        poolMetrics.activeConnections = Math.max(0, poolMetrics.activeConnections - 1);
      });

      // ✅ QUERY ERROR HANDLER - Catch idle transaction errors
      pool.on('query', (query) => {
        // Log slow queries via monitoring service instead of console
        if (query.duration > 5000) {
          const performanceMetrics = require('../utils/performanceMetrics');
          performanceMetrics.recordQuery('slow-query', query.duration);
        }
      });

      // Test connection with manual timeout wrapper
      const connectionTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      );

      const testConnection = async () => {
        const client = await pool.connect();
        try {
          await client.query('SELECT NOW()');
          return true;
        } finally {
          client.release();
        }
      };

      await Promise.race([testConnection(), connectionTimeout]);
    }
    return true;
  } catch (error) {
    // Database initialization error - logged via metrics
    console.log('⚠️  Database connection failed:', error.message);
    if (pool) {
      try {
        await pool.end();
      } catch (e) {}
      pool = null;
    }
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
      if (
        attempt < retries &&
        (error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message.includes('idle in transaction'))
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function getPool() {
  if (!pool) {
    throw new Error('Database Pool not initialized. Call initializeDb() first.');
  }
  return pool;
}

function getPoolMetrics() {
  return { ...poolMetrics };
}

// Graceful shutdown
async function closeDb() {
  if (pool) {
    // Drain pool before closing
    try {
      await pool.end();
    } catch (error) {}

    pool = null;
  }
}

// ✅ GRACEFUL SHUTDOWN HANDLERS
async function gracefulShutdown() {
  await closeDb();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  closeDb().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  closeDb().then(() => process.exit(1));
});

module.exports = {
  initializeDb,
  getPool,
  closeDb,
  queryWithRetry,
  getPoolMetrics,
  SafeClient,
};
