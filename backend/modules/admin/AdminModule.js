
/**
 * 👨‍💼 ADMIN MODULE
 * Modular Monolith - Admin Domain
 */

const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class AdminModule {
  constructor(dependencies) {
    this.eventBus = dependencies.eventBus;
    this.auditService = dependencies.auditService;
    this.pool = getPool();
  }

  /**
   * Get all users
   */
  async getAllUsers(filters = {}) {
    try {
      let query = `SELECT id, email, full_name, role, created_at FROM users WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      if (filters.role) {
        query += ` AND role = $${paramIndex}`;
        params.push(filters.role);
        paramIndex++;
      }

      if (filters.search) {
        query += ` AND (email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Admin Module - Get all users failed', { error });
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, newRole, adminId) {
    try {
      const result = await this.pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role`,
        [newRole, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Log audit
      await this.auditService.log({
        admin_id: adminId,
        action: 'UPDATE_USER_ROLE',
        target_user_id: userId,
        details: { oldRole: null, newRole },
      });

      // Publish event
      this.eventBus.publish(DomainEvents.USER_ROLE_UPDATED, {
        userId,
        newRole,
        adminId,
        timestamp: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      logger.error('Admin Module - Update user role failed', { error });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId, adminId) {
    try {
      const result = await this.pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING id, email`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const deletedUser = result.rows[0];

      // Log audit
      await this.auditService.log({
        admin_id: adminId,
        action: 'DELETE_USER',
        target_user_id: userId,
        details: { email: deletedUser.email },
      });

      return { success: true, deletedUser };
    } catch (error) {
      logger.error('Admin Module - Delete user failed', { error });
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const stats = {};

      // Count users by role
      const usersResult = await this.pool.query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      );
      stats.usersByRole = usersResult.rows;

      // Count tenders by status
      const tendersResult = await this.pool.query(
        `SELECT status, COUNT(*) as count FROM tenders GROUP BY status`
      );
      stats.tendersByStatus = tendersResult.rows;

      // Count total offers
      const offersResult = await this.pool.query(
        `SELECT COUNT(*) as total FROM offers`
      );
      stats.totalOffers = parseInt(offersResult.rows[0].total);

      return stats;
    } catch (error) {
      logger.error('Admin Module - Get platform stats failed', { error });
      throw error;
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    try {
      let query = `SELECT * FROM audit_logs WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      if (filters.admin_id) {
        query += ` AND admin_id = $${paramIndex}`;
        params.push(filters.admin_id);
        paramIndex++;
      }

      if (filters.action) {
        query += ` AND action = $${paramIndex}`;
        params.push(filters.action);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT 100`;

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Admin Module - Get audit logs failed', { error });
      throw error;
    }
  }
}

module.exports = AdminModule;
