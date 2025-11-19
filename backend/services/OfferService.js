const { getPool } = require('../config/db');
const Offer = require('../models/Offer');
const crypto = require('crypto');
const KeyManagementService = require('../security/KeyManagementService');

class OfferService {
    generateOfferNumber() {
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `OFF-${timestamp}-${randomPart}`;
    }

    async createOffer(offerData, userId) {
        const pool = getPool();
        const offer = new Offer(offerData);
        
        try {
            const offerNumber = this.generateOfferNumber();
            
            // تشفير البيانات المالية الحساسة
            const sensitiveData = JSON.stringify({
                total_amount: offer.total_amount,
                financial_proposal: offer.financial_proposal,
                payment_terms: offer.payment_terms
            });
            
            const { iv, encryptedData } = KeyManagementService.encryptData(sensitiveData);
            const keyId = `key_${offerNumber}`;
            
            const result = await pool.query(
                `INSERT INTO offers (tender_id, supplier_id, offer_number, total_amount, currency, 
                 delivery_time, payment_terms, technical_proposal, financial_proposal, attachments, 
                 status, encrypted_data, decryption_key_id, encryption_iv, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                 RETURNING *`,
                [offer.tender_id, userId, offerNumber, offer.total_amount, offer.currency,
                 offer.delivery_time, offer.payment_terms, offer.technical_proposal,
                 offer.financial_proposal, JSON.stringify(offer.attachments), offer.status,
                 encryptedData, keyId, iv, userId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create offer: ${error.message}`);
        }
    }

    async getOfferById(offerId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                'SELECT * FROM offers WHERE id = $1 AND is_deleted = FALSE',
                [offerId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get offer: ${error.message}`);
        }
    }

    async getOffersByTender(tenderId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT o.*, u.company_name, u.full_name 
                 FROM offers o 
                 JOIN users u ON o.supplier_id = u.id 
                 WHERE o.tender_id = $1 AND o.is_deleted = FALSE 
                 ORDER BY o.submitted_at DESC`,
                [tenderId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get offers: ${error.message}`);
        }
    }

    async getOffersBySupplier(supplierId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT o.*, t.title as tender_title, t.tender_number 
                 FROM offers o 
                 JOIN tenders t ON o.tender_id = t.id 
                 WHERE o.supplier_id = $1 AND o.is_deleted = FALSE 
                 ORDER BY o.submitted_at DESC`,
                [supplierId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get supplier offers: ${error.message}`);
        }
    }

    async evaluateOffer(offerId, evaluationData, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `UPDATE offers SET evaluation_score = $1, evaluation_notes = $2, 
                 status = 'evaluated', updated_by = $3, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $4 RETURNING *`,
                [evaluationData.score, evaluationData.notes, userId, offerId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to evaluate offer: ${error.message}`);
        }
    }

    async selectWinningOffer(offerId, userId) {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const offerResult = await client.query('SELECT tender_id FROM offers WHERE id = $1', [offerId]);
            const tenderId = offerResult.rows[0].tender_id;
            
            await client.query(
                'UPDATE offers SET is_winner = FALSE WHERE tender_id = $1',
                [tenderId]
            );
            
            const result = await client.query(
                `UPDATE offers SET is_winner = TRUE, status = 'accepted', 
                 updated_by = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2 RETURNING *`,
                [userId, offerId]
            );
            
            await client.query(
                `UPDATE tenders SET status = 'awarded', updated_by = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [userId, tenderId]
            );
            
            await client.query('COMMIT');
            
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to select winning offer: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async rejectOffer(offerId, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `UPDATE offers SET status = 'rejected', updated_by = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2 RETURNING *`,
                [userId, offerId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to reject offer: ${error.message}`);
        }
    }
}

module.exports = new OfferService();
