
const { getPool } = require('../config/db');
const Message = require('../models/Message');
const AuditLogService = require('./AuditLogService');
const NotificationService = require('./NotificationService');
const DataMapper = require('../helpers/DataMapper');

class ChatService {
    /**
     * Send message between buyer and supplier
     */
    async sendMessage(messageData, userId) {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Verify user has access to the related entity
            const hasAccess = await this.verifyEntityAccess(
                client,
                messageData.related_entity_type,
                messageData.related_entity_id,
                userId
            );
            
            if (!hasAccess) {
                throw new Error('Unauthorized access to this conversation');
            }
            
            // Map frontend data to database schema
            const mappedData = DataMapper.mapMessage(messageData);
            const message = new Message({
                ...mappedData,
                sender_id: userId
            });
            
            const result = await client.query(
                `INSERT INTO messages 
                (id, sender_id, receiver_id, related_entity_type, related_entity_id, 
                 subject, content, attachments, parent_message_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [message.id, message.sender_id, message.receiver_id, 
                 message.related_entity_type, message.related_entity_id,
                 message.subject, message.content, JSON.stringify(message.attachments),
                 message.parent_message_id]
            );
            
            // Send notification to receiver
            await NotificationService.createNotification({
                user_id: message.receiver_id,
                type: 'new_message',
                title: `New message: ${message.subject}`,
                message: message.content.substring(0, 100),
                related_entity_type: 'message',
                related_entity_id: result.rows[0].id
            });
            
            await AuditLogService.log(userId, 'message', result.rows[0].id, 'create', 
                `Sent message regarding ${messageData.related_entity_type}`);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to send message: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Verify user has access to entity
     */
    async verifyEntityAccess(client, entityType, entityId, userId) {
        let query;
        
        switch (entityType) {
            case 'tender':
                query = 'SELECT * FROM tenders WHERE id = $1 AND buyer_id = $2';
                break;
            case 'purchase_order':
                query = 'SELECT * FROM purchase_orders WHERE id = $1 AND (buyer_id = $2 OR supplier_id = $2)';
                break;
            case 'invoice':
                query = 'SELECT * FROM invoices WHERE id = $1 AND (buyer_id = $2 OR supplier_id = $2)';
                break;
            default:
                return false;
        }
        
        const result = await client.query(query, [entityId, userId]);
        return result.rows.length > 0;
    }

    /**
     * Get conversation for an entity
     */
    async getConversation(entityType, entityId, userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT m.*, 
                 sender.full_name as sender_name, sender.company_name as sender_company,
                 receiver.full_name as receiver_name, receiver.company_name as receiver_company
                 FROM messages m
                 JOIN users sender ON m.sender_id = sender.id
                 JOIN users receiver ON m.receiver_id = receiver.id
                 WHERE m.related_entity_type = $1 AND m.related_entity_id = $2
                 AND (m.sender_id = $3 OR m.receiver_id = $3)
                 ORDER BY m.created_at ASC`,
                [entityType, entityId, userId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get conversation: ${error.message}`);
        }
    }

    /**
     * Mark messages as read
     */
    async markAsRead(messageIds, userId) {
        const pool = getPool();
        
        try {
            await pool.query(
                `UPDATE messages 
                 SET is_read = TRUE 
                 WHERE id = ANY($1) AND receiver_id = $2`,
                [messageIds, userId]
            );
            
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to mark messages as read: ${error.message}`);
        }
    }
}

module.exports = new ChatService();
