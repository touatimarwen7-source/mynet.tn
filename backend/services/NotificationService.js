const { getPool } = require('../config/db');

class NotificationService {
    async createNotification(userId, type, title, message, relatedEntityType = null, relatedEntityId = null) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [userId, type, title, message, relatedEntityType, relatedEntityId]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create notification: ${error.message}`);
        }
    }

    async getUserNotifications(userId, unreadOnly = false) {
        const pool = getPool();
        
        try {
            let query = 'SELECT * FROM notifications WHERE user_id = $1';
            const params = [userId];
            
            if (unreadOnly) {
                query += ' AND is_read = FALSE';
            }
            
            query += ' ORDER BY created_at DESC LIMIT 50';
            
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get notifications: ${error.message}`);
        }
    }

    async markAsRead(notificationId, userId) {
        const pool = getPool();
        
        try {
            await pool.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [notificationId, userId]
            );
            
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
    }

    async markAllAsRead(userId) {
        const pool = getPool();
        
        try {
            await pool.query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
                [userId]
            );
            
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to mark all notifications as read: ${error.message}`);
        }
    }

    async notifyTenderPublished(tenderId, tenderTitle, buyerId) {
        const pool = getPool();
        
        try {
            const suppliers = await pool.query(
                `SELECT id FROM users WHERE role = 'supplier' AND is_active = TRUE AND is_deleted = FALSE`
            );
            
            for (const supplier of suppliers.rows) {
                await this.createNotification(
                    supplier.id,
                    'tender_published',
                    'New Tender Available',
                    `A new tender "${tenderTitle}" has been published`,
                    'tender',
                    tenderId
                );
            }
            
            return { success: true, notified: suppliers.rows.length };
        } catch (error) {
            console.error('Failed to notify suppliers:', error.message);
        }
    }

    async notifyOfferSubmitted(tenderId, offerId, buyerId) {
        try {
            await this.createNotification(
                buyerId,
                'offer_submitted',
                'New Offer Received',
                'A new offer has been submitted for your tender',
                'offer',
                offerId
            );
            
            return { success: true };
        } catch (error) {
            console.error('Failed to notify buyer:', error.message);
        }
    }

    async notifyOfferEvaluated(offerId, supplierId, status) {
        try {
            await this.createNotification(
                supplierId,
                'offer_evaluated',
                'Offer Evaluated',
                `Your offer has been evaluated and marked as ${status}`,
                'offer',
                offerId
            );
            
            return { success: true };
        } catch (error) {
            console.error('Failed to notify supplier:', error.message);
        }
    }
}

module.exports = new NotificationService();
