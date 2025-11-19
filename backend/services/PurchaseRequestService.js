
const pool = require('../config/db');
const PurchaseRequest = require('../models/PurchaseRequest');

class PurchaseRequestService {
  async createDirectPurchaseRequest(requestData) {
    const purchaseRequest = new PurchaseRequest(requestData);

    const result = await pool.query(
      `INSERT INTO purchase_requests 
      (id, buyer_id, supplier_id, title, description, category, quantity, unit, budget, status, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [purchaseRequest.id, purchaseRequest.buyer_id, purchaseRequest.supplier_id,
       purchaseRequest.title, purchaseRequest.description, purchaseRequest.category,
       purchaseRequest.quantity, purchaseRequest.unit, purchaseRequest.budget,
       purchaseRequest.status, purchaseRequest.notes]
    );

    return result.rows[0];
  }

  async getRequestsByBuyer(buyerId) {
    const result = await pool.query(
      `SELECT pr.*, u.full_name as supplier_name, u.company_name 
       FROM purchase_requests pr 
       LEFT JOIN users u ON pr.supplier_id = u.id 
       WHERE pr.buyer_id = $1 
       ORDER BY pr.created_at DESC`,
      [buyerId]
    );
    return result.rows;
  }

  async updateRequestStatus(requestId, status, userId) {
    const result = await pool.query(
      `UPDATE purchase_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND (buyer_id = $3 OR supplier_id = $3) 
       RETURNING *`,
      [status, requestId, userId]
    );
    return result.rows[0];
  }
}

module.exports = new PurchaseRequestService();
