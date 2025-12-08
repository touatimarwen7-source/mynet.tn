
/**
 * 📧 NOTIFICATION MODULE
 * Modular Monolith - Notification Domain
 */

const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class NotificationModule {
  constructor(dependencies) {
    this.emailService = dependencies.emailService;
    this.eventBus = dependencies.eventBus;

    // Subscribe to events
    this.subscribeToEvents();
  }

  /**
   * Get database pool
   */
  getPool() {
    return getPool();
  }

  /**
   * Subscribe to domain events
   */
  subscribeToEvents() {
    // Tender events
    this.eventBus.subscribe(DomainEvents.TENDER_CREATED, this.handleTenderCreated.bind(this));
    this.eventBus.subscribe(DomainEvents.TENDER_PUBLISHED, this.handleTenderPublished.bind(this));
    
    // Offer events
    this.eventBus.subscribe(DomainEvents.OFFER_SUBMITTED, this.handleOfferSubmitted.bind(this));
    
    // User events
    this.eventBus.subscribe(DomainEvents.USER_REGISTERED, this.handleUserRegistered.bind(this));
  }

  /**
   * Handle tender created event
   */
  async handleTenderCreated(data) {
    try {
      await this.createNotification({
        user_id: data.buyerId,
        type: 'TENDER_CREATED',
        message: `Tender "${data.title}" has been created`,
        metadata: { tenderId: data.tenderId },
      });
    } catch (error) {
      logger.error('Notification Module - Handle tender created failed', { error: error.message });
    }
  }

  /**
   * Handle tender published event
   */
  async handleTenderPublished(data) {
    try {
      // Notify all suppliers
      await this.notifyAllSuppliers({
        type: 'TENDER_PUBLISHED',
        message: `New tender available: "${data.title}"`,
        metadata: { tenderId: data.tenderId },
      });
    } catch (error) {
      logger.error('Notification Module - Handle tender published failed', { error: error.message });
    }
  }

  /**
   * Handle offer submitted event
   */
  async handleOfferSubmitted(data) {
    const pool = this.getPool();
    try {
      // Get tender details
      const tenderResult = await pool.query(
        `SELECT buyer_id, title FROM tenders WHERE id = $1`,
        [data.tenderId]
      );

      if (tenderResult.rows.length > 0) {
        const tender = tenderResult.rows[0];
        
        await this.createNotification({
          user_id: tender.buyer_id,
          type: 'OFFER_SUBMITTED',
          message: `New offer submitted for "${tender.title}"`,
          metadata: { tenderId: data.tenderId, offerId: data.offerId },
        });
      }
    } catch (error) {
      logger.error('Notification Module - Handle offer submitted failed', { error: error.message });
    }
  }

  /**
   * Handle user registered event
   */
  async handleUserRegistered(data) {
    try {
      await this.emailService.send({
        to: data.email,
        subject: 'Welcome to MyNet.tn',
        text: 'Thank you for registering!',
      });
    } catch (error) {
      logger.error('Notification Module - Handle user registered failed', { error: error.message });
    }
  }

  /**
   * Create notification
   */
  async createNotification(notificationData) {
    const pool = this.getPool();
    try {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, type, message, metadata, created_at, is_read) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          notificationData.user_id,
          notificationData.type,
          notificationData.message,
          JSON.stringify(notificationData.metadata || {}),
          new Date(),
          false
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Notification Module - Create notification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Notify all suppliers
   */
  async notifyAllSuppliers(notificationData) {
    const pool = this.getPool();
    try {
      const suppliersResult = await pool.query(
        `SELECT id FROM users WHERE role = $1`,
        ['supplier']
      );

      const notifications = suppliersResult.rows.map(supplier => ({
        user_id: supplier.id,
        type: notificationData.type,
        message: notificationData.message,
        metadata: notificationData.metadata,
      }));

      for (const notification of notifications) {
        await this.createNotification(notification);
      }
    } catch (error) {
      logger.error('Notification Module - Notify all suppliers failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 50) {
    const pool = this.getPool();
    try {
      const result = await pool.query(
        `SELECT * FROM notifications WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Notification Module - Get user notifications failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    const pool = this.getPool();
    try {
      const result = await pool.query(
        `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
        [notificationId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Notification Module - Mark as read failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = NotificationModule;
