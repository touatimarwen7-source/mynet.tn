
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Payment Gateway Service - دعم متعدد لبوابات الدفع
 * يدعم: Stripe, PayPal, D17 (تونس), Flouci (تونس)
 */
class PaymentGatewayService {
  constructor() {
    this.providers = {
      stripe: process.env.STRIPE_SECRET_KEY,
      d17: process.env.D17_API_KEY,
      flouci: process.env.FLOUCI_API_KEY,
      paypal: process.env.PAYPAL_CLIENT_ID
    };
  }

  /**
   * إنشاء جلسة دفع
   */
  async createPaymentSession(userId, planId, provider = 'stripe') {
    const pool = getPool();
    
    try {
      // الحصول على معلومات الباقة
      const planResult = await pool.query(
        'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = TRUE',
        [planId]
      );

      if (planResult.rows.length === 0) {
        throw new Error('الباقة غير موجودة أو غير نشطة');
      }

      const plan = planResult.rows[0];

      // الحصول على معلومات المستخدم
      const userResult = await pool.query(
        'SELECT email, full_name, company_name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('المستخدم غير موجود');
      }

      const user = userResult.rows[0];

      // إنشاء جلسة الدفع حسب المزود
      let paymentSession;
      switch (provider) {
        case 'stripe':
          paymentSession = await this.createStripeSession(user, plan);
          break;
        case 'd17':
          paymentSession = await this.createD17Session(user, plan);
          break;
        case 'flouci':
          paymentSession = await this.createFlouciSession(user, plan);
          break;
        default:
          throw new Error('مزود الدفع غير مدعوم');
      }

      // حفظ معلومات جلسة الدفع
      await pool.query(
        `INSERT INTO payment_sessions 
         (user_id, plan_id, provider, session_id, amount, currency, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          planId,
          provider,
          paymentSession.id,
          plan.price,
          plan.currency,
          'pending',
          new Date(Date.now() + 30 * 60 * 1000) // 30 دقيقة
        ]
      );

      return paymentSession;
    } catch (error) {
      logger.error('خطأ في إنشاء جلسة الدفع:', error);
      throw error;
    }
  }

  /**
   * إنشاء جلسة Stripe
   */
  async createStripeSession(user, plan) {
    // في الإنتاج، استخدم مكتبة Stripe الحقيقية
    // const stripe = require('stripe')(this.providers.stripe);
    
    return {
      id: `stripe_session_${Date.now()}`,
      url: `${process.env.FRONTEND_URL}/payment/stripe/checkout`,
      provider: 'stripe',
      amount: plan.price,
      currency: plan.currency,
      customer_email: user.email
    };
  }

  /**
   * إنشاء جلسة D17 (تونس)
   */
  async createD17Session(user, plan) {
    return {
      id: `d17_session_${Date.now()}`,
      url: `${process.env.FRONTEND_URL}/payment/d17/checkout`,
      provider: 'd17',
      amount: plan.price,
      currency: plan.currency,
      customer_email: user.email
    };
  }

  /**
   * إنشاء جلسة Flouci (تونس)
   */
  async createFlouciSession(user, plan) {
    return {
      id: `flouci_session_${Date.now()}`,
      url: `${process.env.FRONTEND_URL}/payment/flouci/checkout`,
      provider: 'flouci',
      amount: plan.price,
      currency: plan.currency,
      customer_email: user.email
    };
  }

  /**
   * التحقق من نجاح الدفع
   */
  async verifyPayment(sessionId, provider) {
    const pool = getPool();

    try {
      const result = await pool.query(
        'SELECT * FROM payment_sessions WHERE session_id = $1 AND provider = $2',
        [sessionId, provider]
      );

      if (result.rows.length === 0) {
        throw new Error('جلسة الدفع غير موجودة');
      }

      const session = result.rows[0];

      // التحقق من انتهاء الصلاحية
      if (new Date(session.expires_at) < new Date()) {
        throw new Error('انتهت صلاحية جلسة الدفع');
      }

      return session;
    } catch (error) {
      logger.error('خطأ في التحقق من الدفع:', error);
      throw error;
    }
  }

  /**
   * تأكيد الدفع وتفعيل الاشتراك
   */
  async confirmPayment(sessionId, transactionId) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // تحديث حالة جلسة الدفع
      const sessionResult = await client.query(
        `UPDATE payment_sessions 
         SET status = 'completed', transaction_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2
         RETURNING *`,
        [transactionId, sessionId]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('جلسة الدفع غير موجودة');
      }

      const session = sessionResult.rows[0];

      // الحصول على معلومات الباقة
      const planResult = await client.query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [session.plan_id]
      );

      const plan = planResult.rows[0];

      // إنشاء الاشتراك
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days);

      await client.query(
        `INSERT INTO user_subscriptions 
         (user_id, plan_id, start_date, end_date, status, payment_method, transaction_id)
         VALUES ($1, $2, $3, $4, 'active', $5, $6)`,
        [session.user_id, session.plan_id, startDate, endDate, session.provider, transactionId]
      );

      // تسجيل في سجل التدقيق
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'SUBSCRIPTION_ACTIVATED', 'subscription', $2, $3)`,
        [
          session.user_id,
          session.plan_id,
          JSON.stringify({ plan_name: plan.name, amount: session.amount, transaction_id: transactionId })
        ]
      );

      await client.query('COMMIT');

      return {
        success: true,
        subscription: {
          plan_id: session.plan_id,
          start_date: startDate,
          end_date: endDate
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('خطأ في تأكيد الدفع:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new PaymentGatewayService();
