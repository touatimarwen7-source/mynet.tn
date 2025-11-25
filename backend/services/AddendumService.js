/**
 * Addendum Service
 * Handles addendum (ملحق) creation and publishing
 */

const { getPool } = require('../config/db');
const AuditLogService = require('./AuditLogService');
const DataMapper = require('../helpers/DataMapper');

class AddendumService {
  /**
   * Generate addendum number
   */
  static generateAddendumNumber() {
    return `ADD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  /**
   * Create and publish addendum
   */
  static async createAddendum(tenderId, title, content, inquiryResponses, userId) {
    const pool = getPool();

    try {
      const addendumNumber = this.generateAddendumNumber();

      const result = await pool.query(
        `INSERT INTO addenda (tender_id, addendum_number, title, content, inquiry_responses, published_by, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [tenderId, addendumNumber, title, content, JSON.stringify(inquiryResponses), userId, 1]
      );

      await AuditLogService.log(userId, 'addendum', result.rows[0].id, 'create', `Addendum ${addendumNumber} published`);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating addendum:', error);
      throw new Error(`Failed to create addendum: ${error.message}`);
    }
  }

  /**
   * Get addendum for tender
   */
  static async getAddendaByTender(tenderId, page = 1, limit = 10) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT a.*, u.username, u.email
         FROM addenda a
         LEFT JOIN users u ON a.published_by = u.id
         WHERE a.tender_id = $1 AND a.is_deleted = FALSE
         ORDER BY a.published_at DESC
         LIMIT $2 OFFSET $3`,
        [tenderId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching addenda:', error);
      throw new Error(`Failed to fetch addenda: ${error.message}`);
    }
  }

  /**
   * Notify suppliers about addendum
   */
  static async notifySuppliers(addendumId, supplierEmails, userId) {
    const pool = getPool();

    try {
      const notifications = [];
      
      for (const email of supplierEmails) {
        // Get user by email
        const userResult = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [email]
        );

        if (userResult.rows.length > 0) {
          const notifyResult = await pool.query(
            `INSERT INTO addendum_notifications (addendum_id, user_id, notification_method)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [addendumId, userResult.rows[0].id, 'email']
          );

          notifications.push(notifyResult.rows[0]);
        }
      }

      await AuditLogService.log(userId, 'addendum_notification', addendumId, 'create', `Notifications sent to ${supplierEmails.length} suppliers`);
      return notifications;
    } catch (error) {
      console.error('Error notifying suppliers:', error);
      throw new Error(`Failed to notify suppliers: ${error.message}`);
    }
  }

  /**
   * Get notifications for user
   */
  static async getUserNotifications(userId, page = 1, limit = 10) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `SELECT an.*, a.addendum_number, a.title, t.title as tender_title, t.tender_number
         FROM addendum_notifications an
         LEFT JOIN addenda a ON an.addendum_id = a.id
         LEFT JOIN tenders t ON a.tender_id = t.id
         WHERE an.user_id = $1
         ORDER BY an.sent_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId) {
    const pool = getPool();

    try {
      await pool.query(
        'UPDATE addendum_notifications SET read_at = NOW() WHERE id = $1',
        [notificationId]
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }
}

module.exports = AddendumService;
