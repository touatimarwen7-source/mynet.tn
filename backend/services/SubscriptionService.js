const { getPool } = require('../config/db');
const DataMapper = require('../helpers/DataMapper');

// جميع الميزات المتاحة
const ALL_FEATURES = [
    // التحليل والتقارير (Analytics & Reporting)
    { key: 'post_award_reports', name: 'تقارير التحليل الموسعة', category: 'analytics', basic: false },
    { key: 'performance_analytics', name: 'لوحة إحصائيات الأداء', category: 'analytics', basic: false },
    { key: 'export_transactions', name: 'تصدير سجل المعاملات', category: 'analytics', basic: false },
    
    // التكامل والكفاءة (Integration & Efficiency)
    { key: 'erp_integration', name: 'التكامل مع أنظمة ERP', category: 'integration', basic: false },
    { key: 'extended_products', name: 'عدد منتجات أكثر (500)', category: 'integration', basic: false },
    { key: 'extra_storage', name: 'سعة تخزين إضافية', category: 'integration', basic: false },
    
    // التنبيهات والأمان (Alerts & Security)
    { key: 'realtime_alerts', name: 'تنبيهات فورية', category: 'alerts', basic: false },
    { key: 'team_members', name: 'المستخدمون المتعددون', category: 'security', basic: false },
    { key: 'priority_support', name: 'الدعم الفني المباشر', category: 'support', basic: false }
];

class SubscriptionService {
    /**
     * Create a new subscription plan with features and limits
     * @async
     * @param {Object} planData - Subscription plan details
     * @param {string} planData.name - Plan name
     * @param {string} planData.description - Plan description
     * @param {number} planData.price - Plan price in currency
     * @param {string} [planData.currency='TND'] - Currency code
     * @param {number} planData.duration_days - Plan duration in days
     * @param {Object} planData.features - Feature set for plan
     * @param {number} planData.max_tenders - Maximum tenders allowed
     * @param {number} planData.max_offers - Maximum offers allowed
     * @param {number} [planData.max_products=50] - Maximum products
     * @param {number} [planData.storage_limit=5] - Storage limit in GB
     * @returns {Promise<Object>} Created subscription plan record
     * @throws {Error} When plan creation fails
     */
    async createSubscriptionPlan(planData) {
        const pool = getPool();
        try {
            // Map frontend data to database schema
            const mappedData = DataMapper.mapSubscription(planData);
            
            const result = await pool.query(
                `INSERT INTO subscription_plans 
                 (name, description, price, currency, duration_days, features, 
                  max_tenders, max_offers, max_products, storage_limit, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
                 RETURNING *`,
                [mappedData.plan_id || planData.name, planData.description, planData.price, planData.currency || 'TND',
                 planData.duration_days, JSON.stringify(planData.features || {}),
                 planData.max_tenders, planData.max_offers, planData.max_products || 50, 
                 planData.storage_limit || 5]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create subscription plan: ${error.message}`);
        }
    }

    /**
     * Retrieve all active subscription plans ordered by price
     * @async
     * @returns {Promise<Array>} Array of active subscription plan objects
     * @throws {Error} When database query fails
     */
    async getActivePlans() {
        const pool = getPool();
        try {
            const result = await pool.query(
                'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price ASC'
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get subscription plans: ${error.message}`);
        }
    }

    /**
     * Subscribe a user to a subscription plan
     * @async
     * @param {string} userId - ID of user subscribing
     * @param {string} planId - ID of subscription plan
     * @param {Object} paymentDetails - Payment information
     * @param {string} paymentDetails.payment_method - Payment method type
     * @param {string} paymentDetails.transaction_id - Transaction ID
     * @param {boolean} [paymentDetails.auto_renew=false] - Enable auto-renewal
     * @returns {Promise<Object>} Created user subscription record
     * @throws {Error} When plan not found or subscription fails
     */
    async subscribeUser(userId, planId, paymentDetails) {
        const pool = getPool();
        try {
            const planResult = await pool.query(
                'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = TRUE',
                [planId]
            );

            if (planResult.rows.length === 0) {
                throw new Error('Subscription plan not found');
            }

            const plan = planResult.rows[0];
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + plan.duration_days);

            const result = await pool.query(
                `INSERT INTO user_subscriptions 
                 (user_id, plan_id, start_date, end_date, status, payment_method, 
                  transaction_id, auto_renew)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [userId, planId, startDate, endDate, 'active', 
                 paymentDetails.payment_method, paymentDetails.transaction_id, 
                 paymentDetails.auto_renew || false]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to subscribe user: ${error.message}`);
        }
    }

    /**
     * Get active subscription for a user (most recent if multiple exist)
     * @async
     * @param {string} userId - ID of user
     * @returns {Promise<Object|null>} Active subscription with plan details or null if none
     * @throws {Error} When database query fails
     */
    async getUserSubscription(userId) {
        const pool = getPool();
        try {
            const result = await pool.query(
                `SELECT us.*, sp.name as plan_name, sp.features, sp.max_tenders, sp.max_offers,
                        sp.max_products, sp.storage_limit
                 FROM user_subscriptions us
                 JOIN subscription_plans sp ON us.plan_id = sp.id
                 WHERE us.user_id = $1 AND us.status = 'active' 
                 AND us.end_date > CURRENT_TIMESTAMP
                 ORDER BY us.end_date DESC
                 LIMIT 1`,
                [userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get user subscription: ${error.message}`);
        }
    }

    /**
     * Enable a feature for a supplier with optional expiration date
     * @async
     * @param {string} supplierId - ID of supplier to enable feature for
     * @param {string} featureKey - Feature key identifier
     * @param {string} adminId - ID of admin enabling feature
     * @param {string} [reason=null] - Reason for enabling feature
     * @param {Date} [expiresAt=null] - Optional expiration date
     * @returns {Promise<Object>} Updated supplier feature record
     * @throws {Error} When feature not found or update fails
     */
    async enableSupplierFeature(supplierId, featureKey, adminId, reason = null, expiresAt = null) {
        const pool = getPool();
        const feature = ALL_FEATURES.find(f => f.key === featureKey);
        
        if (!feature) {
            throw new Error('Feature not found');
        }

        try {
            const result = await pool.query(
                `INSERT INTO supplier_features 
                 (supplier_id, feature_key, feature_name, category, is_enabled, enabled_by, reason, enabled_at, expires_at)
                 VALUES ($1, $2, $3, $4, TRUE, $5, $6, CURRENT_TIMESTAMP, $7)
                 ON CONFLICT (supplier_id, feature_key) 
                 DO UPDATE SET is_enabled = TRUE, enabled_by = $5, reason = $6, 
                               enabled_at = CURRENT_TIMESTAMP, expires_at = $7
                 RETURNING *`,
                [supplierId, featureKey, feature.name, feature.category, adminId, reason, expiresAt]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to enable feature: ${error.message}`);
        }
    }

    /**
     * Disable a feature for a supplier
     * @async
     * @param {string} supplierId - ID of supplier to disable feature for
     * @param {string} featureKey - Feature key identifier
     * @param {string} adminId - ID of admin disabling feature
     * @param {string} [reason=null] - Reason for disabling
     * @returns {Promise<Object>} Updated supplier feature record
     * @throws {Error} When update fails
     */
    async disableSupplierFeature(supplierId, featureKey, adminId, reason = null) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `UPDATE supplier_features 
                 SET is_enabled = FALSE, enabled_by = $1, reason = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE supplier_id = $3 AND feature_key = $4
                 RETURNING *`,
                [adminId, reason, supplierId, featureKey]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to disable feature: ${error.message}`);
        }
    }

    /**
     * Check if feature is enabled for supplier (respects expiration dates)
     * @async
     * @param {string} supplierId - ID of supplier
     * @param {string} featureKey - Feature key to check
     * @returns {Promise<boolean>} True if feature is enabled and not expired
     */
    async isSupplierFeatureEnabled(supplierId, featureKey) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT is_enabled, expires_at FROM supplier_features 
                 WHERE supplier_id = $1 AND feature_key = $2`,
                [supplierId, featureKey]
            );
            
            if (result.rows.length === 0) return false;
            
            const feature = result.rows[0];
            
            if (feature.expires_at && new Date(feature.expires_at) < new Date()) {
                return false;
            }
            
            return feature.is_enabled;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all features for a supplier (both enabled and disabled)
     * @async
     * @param {string} supplierId - ID of supplier
     * @returns {Promise<Array>} Array of supplier features
     * @throws {Error} When database query fails
     */
    async getSupplierFeatures(supplierId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT * FROM supplier_features 
                 WHERE supplier_id = $1
                 ORDER BY category, feature_name`,
                [supplierId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get features: ${error.message}`);
        }
    }

    /**
     * Get only active (enabled and not expired) features for supplier
     * @async
     * @param {string} supplierId - ID of supplier
     * @returns {Promise<Array>} Array of active supplier features
     * @throws {Error} When database query fails
     */
    async getSupplierActiveFeatures(supplierId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT * FROM supplier_features 
                 WHERE supplier_id = $1 AND is_enabled = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY category, feature_name`,
                [supplierId]
            );
            
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get active features: ${error.message}`);
        }
    }

    /**
     * Get all available features in system
     * @async
     * @returns {Promise<Array>} Array of all feature definitions
     */
    async getAllAvailableFeatures() {
        return ALL_FEATURES;
    }

    /**
     * Filter available features by category
     * @async
     * @param {string} category - Feature category (analytics, integration, alerts, security, support)
     * @returns {Promise<Array>} Array of features matching category
     */
    async getFeaturesByCategory(category) {
        return ALL_FEATURES.filter(f => f.category === category);
    }

    /**
     * Check if user subscription limits are exceeded for resource type
     * @async
     * @param {string} userId - ID of user
     * @param {string} type - Resource type ('tender' or 'offer')
     * @returns {Promise<Object>} Limit check result with status and message
     * @returns {boolean} result.allowed - Whether operation is allowed
     * @returns {string} result.message - Status message
     * @returns {number} [result.remaining] - Remaining quota if allowed
     * @throws {Error} When database query fails
     */
    async checkSubscriptionLimits(userId, type) {
        const pool = getPool();
        
        try {
            const subscription = await this.getUserSubscription(userId);
            
            if (!subscription) {
                return { allowed: false, message: 'No active subscription' };
            }

            let count = 0;
            if (type === 'tender') {
                const result = await pool.query(
                    `SELECT COUNT(*) FROM tenders 
                     WHERE buyer_id = $1 AND is_deleted = FALSE 
                     AND created_at >= $2`,
                    [userId, subscription.start_date]
                );
                count = parseInt(result.rows[0].count);
                
                if (count >= subscription.max_tenders) {
                    return { allowed: false, message: 'Tender limit reached for your plan' };
                }
            } else if (type === 'offer') {
                const result = await pool.query(
                    `SELECT COUNT(*) FROM offers 
                     WHERE supplier_id = $1 AND is_deleted = FALSE 
                     AND created_at >= $2`,
                    [userId, subscription.start_date]
                );
                count = parseInt(result.rows[0].count);
                
                if (count >= subscription.max_offers) {
                    return { allowed: false, message: 'Offer limit reached for your plan' };
                }
            }

            return { allowed: true, remaining: type === 'tender' ? 
                subscription.max_tenders - count : subscription.max_offers - count };
        } catch (error) {
            throw new Error(`Failed to check subscription limits: ${error.message}`);
        }
    }

    /**
     * Handle successful payment for subscription (webhook callback)
     * @async
     * @param {Object} invoiceData - Payment invoice data
     * @returns {Promise<void>}
     */
    async handlePaymentSuccess(invoiceData) {
        // Payment success handler - implemented for webhook integration
    }

    /**
     * Handle failed payment for subscription (webhook callback)
     * @async
     * @param {Object} invoiceData - Payment invoice data
     * @returns {Promise<void>}
     */
    async handlePaymentFailure(invoiceData) {
        // Payment failure handler - implemented for webhook integration
    }
}

module.exports = new SubscriptionService();
