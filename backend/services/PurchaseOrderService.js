
const { getPool } = require('../config/db');
const PurchaseOrder = require('../models/PurchaseOrder');
const crypto = require('crypto');

class PurchaseOrderService {
    generatePONumber() {
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `PO-${timestamp}-${randomPart}`;
    }

    async createPurchaseOrder(offerId, userId) {
        const pool = getPool();
        
        try {
            // الحصول على بيانات العرض والمناقصة
            const offerResult = await pool.query(
                `SELECT o.*, t.buyer_id, t.title as tender_title 
                 FROM offers o 
                 JOIN tenders t ON o.tender_id = t.id 
                 WHERE o.id = $1 AND o.is_winner = TRUE`,
                [offerId]
            );

            if (offerResult.rows.length === 0) {
                throw new Error('Winning offer not found');
            }

            const offer = offerResult.rows[0];
            const poNumber = this.generatePONumber();

            const result = await pool.query(
                `INSERT INTO purchase_orders 
                 (po_number, tender_id, offer_id, supplier_id, buyer_id, total_amount, 
                  currency, payment_terms, status, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING *`,
                [poNumber, offer.tender_id, offerId, offer.supplier_id, offer.buyer_id,
                 offer.total_amount, offer.currency, offer.payment_terms, 'pending', userId]
            );

            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create purchase order: ${error.message}`);
        }
    }

    async getPurchaseOrderById(poId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT po.*, t.title as tender_title, 
                 u.company_name as supplier_name
                 FROM purchase_orders po
                 JOIN tenders t ON po.tender_id = t.id
                 JOIN users u ON po.supplier_id = u.id
                 WHERE po.id = $1 AND po.is_deleted = FALSE`,
                [poId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get purchase order: ${error.message}`);
        }
    }

    async updatePOStatus(poId, status, userId) {
        const pool = getPool();
        
        const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        try {
            const result = await pool.query(
                `UPDATE purchase_orders 
                 SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $3 RETURNING *`,
                [status, userId, poId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to update purchase order: ${error.message}`);
        }
    }

    async getPurchaseOrdersByBuyer(buyerId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT po.*, t.title as tender_title, 
                 u.company_name as supplier_name
                 FROM purchase_orders po
                 JOIN tenders t ON po.tender_id = t.id
                 JOIN users u ON po.supplier_id = u.id
                 WHERE po.buyer_id = $1 AND po.is_deleted = FALSE
                 ORDER BY po.created_at DESC`,
                [buyerId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get purchase orders: ${error.message}`);
        }
    }

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
