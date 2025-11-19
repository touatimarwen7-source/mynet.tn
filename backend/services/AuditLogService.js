
const { getPool } = require('../config/db');

class AuditLogService {
    async logAction(userId, action, entityType, entityId, details = {}) {
        const pool = getPool();
        
        try {
            await pool.query(
                `INSERT INTO audit_logs 
                 (user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
                [userId, action, entityType, entityId, JSON.stringify(details), 
                 details.ip_address || null, details.user_agent || null]
            );
        } catch (error) {
            console.error('Failed to log audit action:', error.message);
        }
    }

    async getAuditLogs(filters = {}) {
        const pool = getPool();
        let query = `SELECT al.*, u.username, u.full_name 
                     FROM audit_logs al 
                     JOIN users u ON al.user_id = u.id 
                     WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        if (filters.user_id) {
            query += ` AND al.user_id = $${paramIndex}`;
            params.push(filters.user_id);
            paramIndex++;
        }

        if (filters.entity_type) {
            query += ` AND al.entity_type = $${paramIndex}`;
            params.push(filters.entity_type);
            paramIndex++;
        }

        if (filters.entity_id) {
            query += ` AND al.entity_id = $${paramIndex}`;
            params.push(filters.entity_id);
            paramIndex++;
        }

        if (filters.action) {
            query += ` AND al.action = $${paramIndex}`;
            params.push(filters.action);
            paramIndex++;
        }

        query += ` ORDER BY al.created_at DESC LIMIT 100`;

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get audit logs: ${error.message}`);
        }
    }
}

module.exports = new AuditLogService();
