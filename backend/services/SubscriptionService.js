
const { getPool } = require('../config/db');

class SubscriptionService {
    async createSubscriptionPlan(planData) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `INSERT INTO subscription_plans 
                 (name, description, price, currency, duration_days, features, 
                  max_tenders, max_offers, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [planData.name, planData.description, planData.price, planData.currency || 'TND',
                 planData.duration_days, JSON.stringify(planData.features || {}),
                 planData.max_tenders, planData.max_offers, true]
            );
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to create subscription plan: ${error.message}`);
        }
    }

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

    async getUserSubscription(userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT us.*, sp.name as plan_name, sp.features, sp.max_tenders, sp.max_offers
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
}

module.exports = new SubscriptionService();
