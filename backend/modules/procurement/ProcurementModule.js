
/**
 * 🛒 PROCUREMENT MODULE
 * Modular Monolith - Procurement Domain
 */

const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class ProcurementModule {
  constructor(dependencies) {
    this.eventBus = dependencies.eventBus;
    this.notificationService = dependencies.notificationService;
    this.pool = getPool();
  }

  /**
   * Create tender
   */
  async createTender(tenderData, buyerId) {
    try {
      const result = await this.pool.query(
        `INSERT INTO tenders (title, description, buyer_id, created_at) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [tenderData.title, tenderData.description, buyerId, new Date()]
      );
      const tender = result.rows[0];

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
      const result = await this.pool.query(
        `UPDATE tenders SET status = $1, published_at = $2 
         WHERE id = $3 RETURNING *`,
        ['published', new Date(), tenderId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Tender not found');
      }
      
      const tender = result.rows[0];

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
      const result = await this.pool.query(
        `INSERT INTO offers (tender_id, supplier_id, total_price, created_at) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [offerData.tender_id, supplierId, offerData.total_price, new Date()]
      );
      
      const offer = result.rows[0];

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

  /**
   * Get tender by ID
   */
  async getTenderById(tenderId) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM tenders WHERE id = $1`,
        [tenderId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Tender not found');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Procurement Module - Get tender failed', { error });
      throw error;
    }
  }

  /**
   * Get offers for tender
   */
  async getOffersByTender(tenderId) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM offers WHERE tender_id = $1 ORDER BY created_at DESC`,
        [tenderId]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Procurement Module - Get offers failed', { error });
      throw error;
    }
  }
}

module.exports = ProcurementModule;
