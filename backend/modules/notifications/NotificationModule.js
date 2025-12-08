
/**
 * 🔔 NOTIFICATION MODULE
 * Event-driven notifications
 */

const { eventBus, DomainEvents } = require('../../core/EventBus');
const { logger } = require('../../utils/logger');

const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class NotificationModule {
  constructor(dependencies) {
    this.emailService = dependencies.emailService;
    this.eventBus = dependencies.eventBus;
    
    // Register event listeners
    this.registerEventListeners();
  }

  /**
   * Register event listeners
   */
  registerEventListeners() {
    // Listen to tender events
    this.eventBus.subscribe(DomainEvents.TENDER_PUBLISHED, (data) => {
      this.sendTenderPublishedNotification(data);
    });

    this.eventBus.subscribe(DomainEvents.OFFER_SUBMITTED, (data) => {
      this.sendOfferSubmittedNotification(data);
    });

    this.eventBus.subscribe(DomainEvents.TENDER_AWARDED, (data) => {
      this.sendAwardNotification(data);
    });

    // Listen to user events
    this.eventBus.subscribe(DomainEvents.USER_REGISTERED, (data) => {
      this.sendWelcomeEmail(data);
    });

    logger.info('Notification Module - Event listeners registered');
  }

  /**
   * Send tender published notification
   */
  async sendTenderPublishedNotification(data) {
    try {
      logger.info('Sending tender published notification', data);
      // Send email/notification logic
      await this.emailService.send({
        to: 'suppliers@mynet.tn',
        subject: `New Tender Published: ${data.title}`,
        body: `Tender ID: ${data.tenderId}`,
      });
    } catch (error) {
      logger.error('Failed to send tender published notification', { error });
    }
  }

  /**
   * Send offer submitted notification
   */
  async sendOfferSubmittedNotification(data) {
    try {
      logger.info('Sending offer submitted notification', data);
      // Implementation
    } catch (error) {
      logger.error('Failed to send offer submitted notification', { error });
    }
  }

  /**
   * Send award notification
   */
  async sendAwardNotification(data) {
    try {
      logger.info('Sending award notification', data);
      // Implementation
    } catch (error) {
      logger.error('Failed to send award notification', { error });
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data) {
    try {
      logger.info('Sending welcome email', data);
      // Implementation
    } catch (error) {
      logger.error('Failed to send welcome email', { error });
    }
  }
}

module.exports = NotificationModule;
