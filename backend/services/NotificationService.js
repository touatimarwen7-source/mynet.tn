const { getPool } = require('../config/db');

class NotificationService {
    /**
     * Create a new notification for a user
     * @async
     * @param {string} userId - ID of user to notify
     * @param {string} type - Notification type (tender_published, offer_submitted, etc)
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} [relatedEntityType=null] - Type of related entity (tender, offer, etc)
     * @param {string} [relatedEntityId=null] - ID of related entity
     * @returns {Promise<Object>} Created notification record
     * @throws {Error} When notification creation fails
     */
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

    /**
     * Get notifications for a user (up to 50 most recent)
     * @async
     * @param {string} userId - ID of user
     * @param {boolean} [unreadOnly=false] - Only return unread notifications
     * @returns {Promise<Array>} Array of notification records
     * @throws {Error} When database query fails
     */
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

    /**
     * Mark a specific notification as read
     * @async
     * @param {string} notificationId - ID of notification
     * @param {string} userId - ID of user (for authorization)
     * @returns {Promise<Object>} Success status
     * @throws {Error} When update fails
     */
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

    /**
     * Mark all notifications for user as read
     * @async
     * @param {string} userId - ID of user
     * @returns {Promise<Object>} Success status
     * @throws {Error} When update fails
     */
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

    /**
     * Notify relevant suppliers when tender is published
     * Matches tender with supplier preferences and sends notifications
     * @async
     * @param {string} tenderId - ID of published tender
     * @param {string} tenderTitle - Title of tender
     * @param {string} buyerId - ID of buyer who published
     * @param {Object} [tenderData=null] - Tender details for matching
     * @returns {Promise<Object>} Result with count of notified suppliers
     */
    async notifyTenderPublished(tenderId, tenderTitle, buyerId, tenderData = null) {
        const pool = getPool();
        
        try {
            const suppliers = await pool.query(
                `SELECT id, preferred_categories, service_locations, minimum_budget 
                 FROM users WHERE role = 'supplier' AND is_active = TRUE AND is_deleted = FALSE`
            );
            
            let notifiedCount = 0;
            
            for (const supplier of suppliers.rows) {
                const isMatched = this.matchSupplierWithTender(supplier, tenderData);
                
                if (isMatched) {
                    await this.createNotification(
                        supplier.id,
                        'tender_published',
                        'New Tender Available',
                        `A new tender "${tenderTitle}" matches your preferences`,
                        'tender',
                        tenderId
                    );
                    notifiedCount++;
                }
            }
            
            return { success: true, notified: notifiedCount, total_suppliers: suppliers.rows.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Check if supplier matches tender criteria based on preferences
     * Compares category, location, budget, and verification status
     * @private
     * @param {Object} supplier - Supplier user record
     * @param {Object} tenderData - Tender details
     * @returns {boolean} True if supplier matches tender
     */
    matchSupplierWithTender(supplier, tenderData) {
        if (!tenderData) return true;
        
        const supplierCategories = supplier.preferred_categories || [];
        const supplierLocations = supplier.service_locations || [];
        const supplierMinBudget = supplier.minimum_budget || 0;
        
        const tenderCategory = tenderData.category;
        const tenderLocation = tenderData.service_location;
        const tenderBudgetMin = tenderData.budget_min;
        
        const categoryMatches = supplierCategories.length === 0 || 
                               supplierCategories.includes(tenderCategory);
        
        const locationMatches = supplierLocations.length === 0 || 
                               supplierLocations.includes(tenderLocation);
        
        const budgetMatches = tenderBudgetMin >= supplierMinBudget;
        
        const isVerified = supplier.is_verified !== false;
        
        return categoryMatches && locationMatches && budgetMatches && isVerified;
    }

    /**
     * Notify buyer when offer is submitted for their tender
     * @async
     * @param {string} tenderId - ID of tender
     * @param {string} offerId - ID of submitted offer
     * @param {string} buyerId - ID of buyer to notify
     * @returns {Promise<Object>} Success status
     */
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
            // Notification error - don't break flow
        }
    }

    /**
     * Notify supplier when their offer has been evaluated
     * @async
     * @param {string} offerId - ID of evaluated offer
     * @param {string} supplierId - ID of supplier to notify
     * @param {string} status - Evaluation status (accepted, rejected, etc)
     * @returns {Promise<Object>} Success status
     */
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
            // Notification error - don't break flow
        }
    }
}

module.exports = new NotificationService();
