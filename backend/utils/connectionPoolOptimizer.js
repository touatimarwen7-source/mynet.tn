/**
 * 🔄 CONNECTION POOL OPTIMIZER
 * Optimizes database connection pool usage
 */

class PoolOptimizer {
  /**
   * Get optimized pool configuration based on workload
   */
  static getOptimalConfig(env = 'production') {
    const configs = {
      development: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000
      },
      production: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
        query_timeout: 30000
      },
      testing: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
      }
    };

    return configs[env] || configs.production;
  }

  /**
   * Monitor pool health
   */
  static getPoolStats(pool) {
    if (!pool || !pool._clients) return null;

    const total = pool._clients.length;
    const available = pool._availableClients?.length || 0;
    const inUse = total - available;
    const waitingQueue = pool._waitingClients?.length || 0;

    return {
      total,
      available,
      inUse,
      waitingQueue,
      utilization: ((inUse / total) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Warn if pool is exhausted
   */
  static checkPoolHealth(pool) {
    const stats = this.getPoolStats(pool);
    if (!stats) return;

    if (stats.utilization > 90) {
      console.warn('⚠️ Connection pool near capacity:', stats.utilization);
    }

    if (stats.waitingQueue > 5) {
      console.warn('⚠️ Clients waiting for connections:', stats.waitingQueue);
    }
  }
}

module.exports = PoolOptimizer;
