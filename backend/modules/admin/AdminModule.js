
/**
 * 🔐 ADMIN MODULE
 * Modular Monolith - Administration Domain
 */

const { eventBus, DomainEvents } = require('../../core/EventBus');
const { logger } = require('../../utils/logger');

const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class AdminModule {
  constructor(dependencies) {
    this.eventBus = dependencies.eventBus;
    this.auditService = dependencies.auditService;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const pool = getPool();
      const stats = await pool.query(`
        WITH user_stats AS (
          SELECT COUNT(*) as total_users FROM users WHERE is_deleted = FALSE
        ),
        tender_stats AS (
          SELECT COUNT(*) as total_tenders FROM tenders WHERE is_deleted = FALSE
        ),
        offer_stats AS (
          SELECT COUNT(*) as total_offers FROM offers WHERE is_deleted = FALSE
        )
        SELECT * FROM user_stats, tender_stats, offer_stats
      `);

      this.eventBus.publish(DomainEvents.AUDIT_LOG, {
        action: 'admin.dashboard.viewed',
        timestamp: new Date().toISOString(),
      });

      return stats.rows[0];
    } catch (error) {
      logger.error('Admin Module - Get dashboard stats failed', { error });
      throw error;
    }
  }

  /**
   * Manage user status
   */
  async toggleUserStatus(userId, isActive) {
    try {
      const pool = getPool();
      await pool.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [isActive, userId]
      );

      this.eventBus.publish(DomainEvents.AUDIT_LOG, {
        action: 'admin.user.status_changed',
        userId,
        newStatus: isActive,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      logger.error('Admin Module - Toggle user status failed', { error });
      throw error;
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(format = 'json') {
    try {
      const pool = getPool();
      const logs = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');

      this.eventBus.publish(DomainEvents.AUDIT_LOG, {
        action: 'admin.audit_logs.exported',
        format,
        count: logs.rowCount,
        timestamp: new Date().toISOString(),
      });

      return logs.rows;
    } catch (error) {
      logger.error('Admin Module - Export audit logs failed', { error });
      throw error;
    }
  }
}

module.exports = AdminModule;
