const { getPool } = require('../config/db');
const PurchaseOrder = require('../models/PurchaseOrder');
const crypto = require('crypto');
const DataMapper = require('../helpers/DataMapper');

class PurchaseOrderService {
  /**
   * Generate unique purchase order number using timestamp and random hex
   * @private
   * @returns {string} Generated PO number (format: PO-YYYYMMDD-RANDOMHEX)
   */
  generatePONumber() {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PO-${timestamp}-${randomPart}`;
  }

  /**
   * Create purchase order from tender and buyer data
   * @async
   * @param {Object} purchaseOrderData - Purchase order details
   * @returns {Promise<Object>} Created purchase order record
   * @throws {Error} When validation fails or creation error
   */
  async createPurchaseOrder(purchaseOrderData) {
    const pool = getPool();

    try {
      // Validate required fields
      if (!purchaseOrderData.tender_id || !purchaseOrderData.buyer_id) {
        throw new Error('tender_id et buyer_id sont requis');
      }

      const poNumber = this.generatePONumber();
      const purchaseOrder = new PurchaseOrder({
        ...purchaseOrderData,
        po_number: poNumber,
        status: purchaseOrderData.status || 'pending',
        currency: purchaseOrderData.currency || 'TND',
        issue_date: new Date(),
      });

      const result = await pool.query(
        `INSERT INTO purchase_orders 
        (id, po_number, tender_id, offer_id, supplier_id, buyer_id, 
         total_amount, currency, status, issue_date, delivery_date, 
         payment_terms, terms_and_conditions, items, attachments, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          purchaseOrder.id,
          purchaseOrder.po_number,
          purchaseOrder.tender_id,
          purchaseOrder.offer_id,
          purchaseOrder.supplier_id,
          purchaseOrder.buyer_id,
          purchaseOrder.total_amount,
          purchaseOrder.currency,
          purchaseOrder.status,
          purchaseOrder.issue_date,
          purchaseOrder.delivery_date,
          purchaseOrder.payment_terms,
          purchaseOrder.terms_and_conditions,
          JSON.stringify(purchaseOrder.items),
          JSON.stringify(purchaseOrder.attachments),
          purchaseOrder.notes,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create purchase order: ${error.message}`);
    }
  }

  /**
   * Get purchase order by ID with related details
   * @async
   * @param {string} poId - ID of purchase order
   * @param {string} userId - Current user ID for authorization
   * @returns {Promise<Object|null>} Purchase order record with tender and supplier info or null
   * @throws {Error} When database query fails
   */
  async getPurchaseOrderById(poId, userId) {
    const pool = getPool();

    try {
      const result = await pool.query(
        `SELECT po.*, t.title as tender_title, 
                u.company_name as supplier_name
         FROM purchase_orders po
         JOIN tenders t ON po.tender_id = t.id
         LEFT JOIN users u ON po.supplier_id = u.id
         WHERE po.id = $1 
           AND (po.buyer_id = $2 OR po.supplier_id = $2)
           AND po.is_deleted = FALSE`,
        [poId, userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Échec de récupération du bon de commande: ${error.message}`);
    }
  }

  /**
   * Update purchase order status
   * @async
   * @param {string} poId - ID of purchase order to update
   * @param {string} status - New status (pending, approved, in_progress, completed, cancelled)
   * @param {string} userId - ID of user performing update
   * @returns {Promise<Object>} Updated purchase order record
   * @throws {Error} When invalid status or update fails
   */
  async updatePurchaseOrderStatus(poId, status, userId) {
    const pool = getPool();

    const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    try {
      const result = await pool.query(
        `UPDATE purchase_orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 
           AND (buyer_id = $3 OR supplier_id = $3)
           AND is_deleted = FALSE
         RETURNING *`,
        [status, poId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Bon de commande introuvable ou non autorisé');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Échec de mise à jour du statut: ${error.message}`);
    }
  }

  /**
   * Get all purchase orders for a buyer
   * @async
   * @param {string} buyerId - ID of buyer
   * @returns {Promise<Array>} Array of purchase orders with tender and supplier details
   * @throws {Error} When database query fails
   */
  async getPurchaseOrdersByBuyer(buyerId) {
    const pool = getPool();

    try {
      const result = await pool.query(
        `SELECT po.*, t.title as tender_title, 
                u.company_name as supplier_name
         FROM purchase_orders po
         JOIN tenders t ON po.tender_id = t.id
         LEFT JOIN users u ON po.supplier_id = u.id
         WHERE po.buyer_id = $1 AND po.is_deleted = FALSE
         ORDER BY po.created_at DESC`,
        [buyerId]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get purchase orders: ${error.message}`);
    }
  }

  /**
   * Get all purchase orders for a supplier
   * @async
   * @param {string} supplierId - ID of supplier
   * @returns {Promise<Array>} Array of purchase orders with tender details
   * @throws {Error} When database query fails
   */
  async getPurchaseOrdersBySupplier(supplierId) {
    const pool = getPool();

    try {
      const result = await pool.query(
        `SELECT po.*, t.title as tender_title
         FROM purchase_orders po
         JOIN tenders t ON po.tender_id = t.id
         WHERE po.supplier_id = $1 AND po.is_deleted = FALSE
         ORDER BY po.created_at DESC`,
        [supplierId]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get purchase orders: ${error.message}`);
    }
  }
}

module.exports = new PurchaseOrderService();