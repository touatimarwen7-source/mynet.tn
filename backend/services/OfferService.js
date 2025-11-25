const { getPool } = require('../config/db');
const Offer = require('../models/Offer');
const crypto = require('crypto');
const KeyManagementService = require('../security/KeyManagementService');
const DataMapper = require('../helpers/DataMapper');

class OfferService {
    // 🚀 PERFORMANCE: Batch processing queue
    constructor() {
        this.offerQueue = [];
        this.queueProcessingInterval = null;
        this.batchSize = 10;
        this.batchTimeoutMs = 500; // Process batch every 500ms or when full
    }

    generateOfferNumber() {
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `OFF-${timestamp}-${randomPart}`;
    }

    // 🚀 OPTIMIZATION: Batch insert for high-frequency bid submissions
    async createOfferBatch(offersData, userId) {
        const pool = getPool();
        
        try {
            const values = [];
            let paramIndex = 1;
            
            offersData.forEach(offerData => {
                const offer = new Offer(offerData);
                const offerNumber = this.generateOfferNumber();
                const sensitiveData = JSON.stringify({
                    total_amount: offer.total_amount,
                    financial_proposal: offer.financial_proposal,
                    payment_terms: offer.payment_terms
                });
                const { iv, encryptedData } = KeyManagementService.encryptData(sensitiveData);
                const keyId = `key_${offerNumber}`;
                
                values.push([
                    offer.tender_id, userId, offerNumber, offer.total_amount, offer.currency,
                    offer.delivery_time, offer.payment_terms, offer.technical_proposal,
                    offer.financial_proposal, JSON.stringify(offer.attachments), offer.status,
                    encryptedData, keyId, iv, userId
                ]);
            });

            // Multi-row insert (faster than individual inserts)
            const placeholders = values.map((_, idx) => {
                const start = idx * 15;
                return `($${start + 1},$${start + 2},$${start + 3},$${start + 4},$${start + 5},$${start + 6},$${start + 7},$${start + 8},$${start + 9},$${start + 10},$${start + 11},$${start + 12},$${start + 13},$${start + 14},$${start + 15})`;
            }).join(',');

            const flatValues = values.flat();
            const query = `INSERT INTO offers (tender_id, supplier_id, offer_number, total_amount, currency, 
                 delivery_time, payment_terms, technical_proposal, financial_proposal, attachments, 
                 status, encrypted_data, decryption_key_id, encryption_iv, created_by)
                 VALUES ${placeholders} RETURNING *`;
            
            const result = await pool.query(query, flatValues);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to batch create offers: ${error.message}`);
        }
    }

    async createOffer(offerData, userId) {
        const pool = getPool();
        
        // Map frontend data to database schema
        const mappedData = DataMapper.mapOffer(offerData);
        const offer = new Offer(mappedData);
        
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

    async getOfferById(offerId, userId = null) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT o.*, t.opening_date, t.buyer_id 
                 FROM offers o 
                 JOIN tenders t ON o.tender_id = t.id 
                 WHERE o.id = $1 AND o.is_deleted = FALSE`,
                [offerId]
            );
            
            if (result.rows.length === 0) {
                return null;
            }

            const offer = result.rows[0];
            const openingDate = new Date(offer.opening_date);
            const currentDate = new Date();
            const isBeforeOpening = currentDate < openingDate;
            const isBuyer = userId && userId === offer.buyer_id;
            const isSupplier = userId && userId === offer.supplier_id;

            // إخفاء البيانات المالية قبل تاريخ الفتح (إلا للمورد صاحب العرض)
            if (isBeforeOpening && isBuyer) {
                return {
                    id: offer.id,
                    offer_number: offer.offer_number,
                    status: offer.status,
                    submitted_at: offer.submitted_at,
                    is_sealed: true,
                    message: 'Offer details are sealed until opening date'
                };
            }

            return offer;
        } catch (error) {
            throw new Error(`Failed to get offer: ${error.message}`);
        }
    }

    async getOffersByTender(tenderId, userId = null) {
        const pool = getPool();
        
        try {
            // الحصول على تاريخ فتح المناقصة
            const tenderResult = await pool.query(
                'SELECT opening_date, buyer_id FROM tenders WHERE id = $1',
                [tenderId]
            );

            if (tenderResult.rows.length === 0) {
                throw new Error('Tender not found');
            }

            const tender = tenderResult.rows[0];
            const openingDate = new Date(tender.opening_date);
            const currentDate = new Date();
            const isBeforeOpening = currentDate < openingDate;
            const isBuyer = userId && userId === tender.buyer_id;

            // إذا كان قبل تاريخ الفتح والمستخدم هو المشتري
            if (isBeforeOpening && isBuyer) {
                // إرجاع عدد العروض فقط
                const countResult = await pool.query(
                    `SELECT COUNT(*) as total_offers FROM offers 
                     WHERE tender_id = $1 AND is_deleted = FALSE`,
                    [tenderId]
                );

                return {
                    is_sealed: true,
                    total_offers: parseInt(countResult.rows[0].total_offers),
                    opening_date: tender.opening_date,
                    message: 'Offers are sealed until opening date'
                };
            }

            // بعد تاريخ الفتح أو للموردين (يرون عروضهم فقط)
            const result = await pool.query(
                `SELECT o.*, u.company_name, u.full_name 
                 FROM offers o 
                 JOIN users u ON o.supplier_id = u.id 
                 WHERE o.tender_id = $1 AND o.is_deleted = FALSE 
                 ORDER BY o.submitted_at DESC`,
                [tenderId]
            );
            
            return {
                is_sealed: false,
                total_offers: result.rows.length,
                offers: result.rows
            };
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
