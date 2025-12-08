
const express = require('express');
const router = express.Router();
const PaymentGatewayService = require('../services/PaymentGatewayService');
const SubscriptionService = require('../services/SubscriptionService');
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const logger = require('../utils/logger');

// جميع المسارات تتطلب المصادقة
router.use(authMiddleware.verifyToken);

/**
 * إنشاء جلسة دفع لاشتراك جديد
 * POST /api/payments/create-session
 */
router.post('/create-session', async (req, res) => {
  try {
    const { planId, provider = 'stripe' } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الباقة مطلوب'
      });
    }

    const session = await PaymentGatewayService.createPaymentSession(userId, planId, provider);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('خطأ في إنشاء جلسة الدفع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * التحقق من حالة الدفع
 * GET /api/payments/verify/:sessionId
 */
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { provider } = req.query;

    const session = await PaymentGatewayService.verifyPayment(sessionId, provider);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('خطأ في التحقق من الدفع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * تأكيد الدفع وتفعيل الاشتراك
 * POST /api/payments/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    const { sessionId, transactionId } = req.body;

    if (!sessionId || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الجلسة ومعرف المعاملة مطلوبان'
      });
    }

    const result = await PaymentGatewayService.confirmPayment(sessionId, transactionId);

    res.json(result);
  } catch (error) {
    logger.error('خطأ في تأكيد الدفع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * الحصول على حالة الاشتراك الحالي
 * GET /api/payments/subscription/status
 */
router.get('/subscription/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await SubscriptionService.getUserSubscription(userId);

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          isTrialPeriod: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: true,
        subscription
      }
    });
  } catch (error) {
    logger.error('خطأ في الحصول على حالة الاشتراك:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * إلغاء الاشتراك
 * POST /api/payments/subscription/cancel
 */
router.post('/subscription/cancel', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // تحديث حالة الاشتراك إلى ملغى
    const { getPool } = require('../config/db');
    const pool = getPool();

    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح'
    });
  } catch (error) {
    logger.error('خطأ في إلغاء الاشتراك:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
