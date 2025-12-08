
/**
 * 🛒 PROCUREMENT MODULE
 * Modular Monolith - Procurement Domain
 */

const { eventBus, DomainEvents } = require('../../core/EventBus');
const { logger } = require('../../utils/logger');

const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class ProcurementModule {
  constructor(dependencies) {
    this.eventBus = dependencies.eventBus;
    this.notificationService = dependencies.notificationService;
  }

  /**
   * Create tender
   */
  async createTender(tenderData, buyerId) {
    try {
      const tender = await this.db.createTender({
        ...tenderData,
        buyer_id: buyerId,
        created_at: new Date(),
      });

      // Publish event
      this.eventBus.publish(DomainEvents.TENDER_CREATED, {
        tenderId: tender.id,
        buyerId,
        title: tender.title,
        timestamp: new Date().toISOString(),
      });

      return tender;
    } catch (error) {
      logger.error('Procurement Module - Create tender failed', { error });
      throw error;
    }
  }

  /**
   * Publish tender
   */
  async publishTender(tenderId) {
    try {
      const tender = await this.db.updateTender(tenderId, {
        status: 'published',
        published_at: new Date(),
      });

      // Publish event
      this.eventBus.publish(DomainEvents.TENDER_PUBLISHED, {
        tenderId: tender.id,
        title: tender.title,
        timestamp: new Date().toISOString(),
      });

      return tender;
    } catch (error) {
      logger.error('Procurement Module - Publish tender failed', { error });
      throw error;
    }
  }

  /**
   * Submit offer
   */
  async submitOffer(offerData, supplierId) {
    try {
      const offer = await this.db.createOffer({
        ...offerData,
        supplier_id: supplierId,
        created_at: new Date(),
      });

      // Publish event
      this.eventBus.publish(DomainEvents.OFFER_SUBMITTED, {
        offerId: offer.id,
        tenderId: offer.tender_id,
        supplierId,
        timestamp: new Date().toISOString(),
      });

      return offer;
    } catch (error) {
      logger.error('Procurement Module - Submit offer failed', { error });
      throw error;
    }
  }
}

module.exports = ProcurementModule;
