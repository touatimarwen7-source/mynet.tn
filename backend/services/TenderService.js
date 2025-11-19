const { getPool } = require('../config/db');
const Tender = require('../models/Tender');

class TenderService {
    async createTender(tenderData, userId) {
        const pool = getPool();
        const tender = new Tender(tenderData);
        
        try {
            const tenderNumber = `TND-${Date.now()}`;
            
            const result = await pool.query(
                `INSERT INTO tenders (tender_number, title, description, category, budget_min, budget_max, 
                 currency, status, publish_date, deadline, opening_date, requirements, attachments, 
                 buyer_id, is_public, evaluation_criteria, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                 RETURNING *`,
                [tenderNumber, tender.title, tender.description, tender.category, tender.budget_min,
                 tender.budget_max, tender.currency, tender.status, tender.publish_date, tender.deadline,
                 tender.opening_date, JSON.stringify(tender.requirements), JSON.stringify(tender.attachments),
                 userId, tender.is_public, JSON.stringify(tender.evaluation_criteria), userId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create tender: ${error.message}`);
        }
    }

    async getTenderById(tenderId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                'SELECT * FROM tenders WHERE id = $1 AND is_deleted = FALSE',
                [tenderId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get tender: ${error.message}`);
        }
    }

    async getAllTenders(filters = {}) {
        const pool = getPool();
        let query = 'SELECT * FROM tenders WHERE is_deleted = FALSE';
        const params = [];
        let paramCount = 1;

        if (filters.status) {
            query += ` AND status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        if (filters.category) {
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
            paramCount++;
        }

        if (filters.is_public !== undefined) {
            query += ` AND is_public = $${paramCount}`;
            params.push(filters.is_public);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
            paramCount++;
        }

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get tenders: ${error.message}`);
        }
    }

    async updateTender(tenderId, updateData, userId) {
        const pool = getPool();
        
        try {
            const fields = [];
            const values = [];
            let paramCount = 1;

            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && updateData[key] !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(updateData[key]);
                    paramCount++;
                }
            });

            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            fields.push(`updated_by = $${paramCount}`);
            values.push(userId);
            paramCount++;

            values.push(tenderId);

            const query = `UPDATE tenders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
            const result = await pool.query(query, values);
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to update tender: ${error.message}`);
        }
    }

    async deleteTender(tenderId, userId) {
        const pool = getPool();
        
        try {
            await pool.query(
                'UPDATE tenders SET is_deleted = TRUE, updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [userId, tenderId]
            );
            
            return { success: true, message: 'Tender deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete tender: ${error.message}`);
        }
    }

    async publishTender(tenderId, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `UPDATE tenders SET status = 'published', publish_date = CURRENT_TIMESTAMP, 
                 updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
                [userId, tenderId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to publish tender: ${error.message}`);
        }
    }

    async closeTender(tenderId, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `UPDATE tenders SET status = 'closed', updated_by = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2 RETURNING *`,
                [userId, tenderId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to close tender: ${error.message}`);
        }
    }
}

module.exports = new TenderService();
