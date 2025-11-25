
const { getPool } = require('../config/db');
const AuditLogService = require('./AuditLogService');
const DataMapper = require('../helpers/DataMapper');

class TenderAwardService {
    /**
     * Initialize line items for a tender award
     */
    async initializeTenderAward(tenderId, lineItems, userId) {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Verify tender exists and user has permission
            const tenderResult = await client.query(
                'SELECT * FROM tenders WHERE id = $1 AND buyer_id = $2',
                [tenderId, userId]
            );
            
            if (tenderResult.rows.length === 0) {
                throw new Error('Tender not found or unauthorized');
            }
            
            // Create line items for award
            const insertedItems = [];
            for (const item of lineItems) {
                const result = await client.query(
                    `INSERT INTO tender_award_line_items 
                    (tender_id, line_item_id, item_description, total_quantity, unit, awarded_offers, status, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [tenderId, item.line_item_id, item.description, item.quantity, 
                     item.unit, JSON.stringify([]), 'pending', userId]
                );
                insertedItems.push(result.rows[0]);
            }
            
            await AuditLogService.log(userId, 'tender_award', tenderId, 'initialize', 
                `Initialized ${lineItems.length} line items for award`);
            
            await client.query('COMMIT');
            return insertedItems;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to initialize tender award: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Distribute quantity for a specific line item across suppliers
     */
    async distributeLineItem(tenderId, lineItemId, distribution, userId) {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get line item
            const itemResult = await client.query(
                'SELECT * FROM tender_award_line_items WHERE tender_id = $1 AND line_item_id = $2',
                [tenderId, lineItemId]
            );
            
            if (itemResult.rows.length === 0) {
                throw new Error('Line item not found');
            }
            
            const lineItem = itemResult.rows[0];
            
            // Validate total quantity matches
            const totalDistributed = distribution.reduce((sum, d) => sum + d.quantity, 0);
            if (totalDistributed > lineItem.total_quantity) {
                throw new Error(`Total distributed quantity (${totalDistributed}) exceeds available quantity (${lineItem.total_quantity})`);
            }
            
            // Validate all offers belong to the tender
            const offerIds = distribution.map(d => d.offer_id);
            const offersResult = await client.query(
                'SELECT id, supplier_id, total_amount FROM offers WHERE id = ANY($1) AND tender_id = $2',
                [offerIds, tenderId]
            );
            
            if (offersResult.rows.length !== offerIds.length) {
                throw new Error('One or more offers not found or do not belong to this tender');
            }
            
            // Prepare awarded offers array
            const awardedOffers = distribution.map(d => {
                const offer = offersResult.rows.find(o => o.id === d.offer_id);
                return {
                    offer_id: d.offer_id,
                    supplier_id: offer.supplier_id,
                    quantity: d.quantity,
                    unit_price: d.unit_price,
                    total_amount: d.quantity * d.unit_price
                };
            });
            
            // Update line item
            const result = await client.query(
                `UPDATE tender_award_line_items 
                SET awarded_offers = $1, status = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
                WHERE tender_id = $4 AND line_item_id = $5
                RETURNING *`,
                [JSON.stringify(awardedOffers), 
                 totalDistributed === lineItem.total_quantity ? 'awarded' : 'partial',
                 userId, tenderId, lineItemId]
            );
            
            await AuditLogService.log(userId, 'tender_award', tenderId, 'distribute_line_item', 
                `Distributed line item ${lineItemId} across ${distribution.length} suppliers`);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to distribute line item: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Get award details for a tender
     */
    async getTenderAwardDetails(tenderId, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT tal.*, t.title as tender_title, t.tender_number
                FROM tender_award_line_items tal
                JOIN tenders t ON tal.tender_id = t.id
                WHERE tal.tender_id = $1
                ORDER BY tal.line_item_id`,
                [tenderId]
            );
            
            await AuditLogService.log(userId, 'tender_award', tenderId, 'read', 
                'Retrieved tender award details');
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get tender award details: ${error.message}`);
        }
    }

    /**
     * Finalize the tender award and create purchase orders
     */
    async finalizeTenderAward(tenderId, userId) {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get all line items
            const itemsResult = await client.query(
                'SELECT * FROM tender_award_line_items WHERE tender_id = $1',
                [tenderId]
            );
            
            if (itemsResult.rows.length === 0) {
                throw new Error('No line items found for this tender');
            }
            
            // Check all items are awarded
            const pendingItems = itemsResult.rows.filter(item => item.status === 'pending');
            if (pendingItems.length > 0) {
                throw new Error(`${pendingItems.length} line items are still pending distribution`);
            }
            
            // Group by supplier and create purchase orders
            const supplierOrders = {};
            
            for (const item of itemsResult.rows) {
                const awardedOffers = JSON.parse(item.awarded_offers);
                
                for (const award of awardedOffers) {
                    if (!supplierOrders[award.supplier_id]) {
                        supplierOrders[award.supplier_id] = {
                            supplier_id: award.supplier_id,
                            items: [],
                            total_amount: 0
                        };
                    }
                    
                    supplierOrders[award.supplier_id].items.push({
                        line_item_id: item.line_item_id,
                        description: item.item_description,
                        quantity: award.quantity,
                        unit: item.unit,
                        unit_price: award.unit_price,
                        total_amount: award.total_amount
                    });
                    
                    supplierOrders[award.supplier_id].total_amount += award.total_amount;
                }
            }
            
            // Create purchase orders for each supplier
            const createdPOs = [];
            for (const [supplierId, orderData] of Object.entries(supplierOrders)) {
                const poNumber = this.generatePONumber();
                
                const poResult = await client.query(
                    `INSERT INTO purchase_orders 
                    (po_number, tender_id, supplier_id, buyer_id, items, total_amount, 
                     currency, status, issue_date, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9)
                    RETURNING *`,
                    [poNumber, tenderId, supplierId, userId, JSON.stringify(orderData.items),
                     orderData.total_amount, 'TND', 'issued', userId]
                );
                
                createdPOs.push(poResult.rows[0]);
            }
            
            // Update tender status
            await client.query(
                'UPDATE tenders SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                ['awarded', userId, tenderId]
            );
            
            // Mark all line items as finalized
            await client.query(
                'UPDATE tender_award_line_items SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE tender_id = $3',
                ['finalized', userId, tenderId]
            );
            
            await AuditLogService.log(userId, 'tender_award', tenderId, 'finalize', 
                `Finalized tender award with ${createdPOs.length} purchase orders`);
            
            await client.query('COMMIT');
            return { purchaseOrders: createdPOs, supplierCount: Object.keys(supplierOrders).length };
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to finalize tender award: ${error.message}`);
        } finally {
            client.release();
        }
    }

    generatePONumber() {
        const crypto = require('crypto');
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `PO-${timestamp}-${randomPart}`;
    }
}

module.exports = new TenderAwardService();
