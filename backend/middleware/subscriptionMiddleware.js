
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Middleware للتحقق من الاشتراك النشط
 */
const checkActiveSubscription = async (req, res, next) => {
  const pool = getPool();

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح',
        requiresAuth: true
      });
    }

    // التحقق من وجود اشتراك نشط
    const result = await pool.query(
      `SELECT us.*, sp.name as plan_name, sp.features, sp.max_tenders, sp.max_offers
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 
         AND us.status = 'active' 
         AND us.end_date > CURRENT_TIMESTAMP
       ORDER BY us.end_date DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'يتطلب اشتراك نشط',
        requiresSubscription: true,
        redirectTo: '/subscription-plans'
      });
    }

    // إضافة معلومات الاشتراك إلى الطلب
    req.subscription = result.rows[0];
    next();
  } catch (error) {
    logger.error('خطأ في التحقق من الاشتراك:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في التحقق من الاشتراك'
    });
  }
};

/**
 * Middleware للتحقق من حدود الاشتراك
 */
const checkSubscriptionLimits = (resourceType) => {
  return async (req, res, next) => {
    const pool = getPool();

    try {
      if (!req.subscription) {
        return res.status(403).json({
          success: false,
          error: 'يتطلب اشتراك نشط'
        });
      }

      const userId = req.user.id;
      const subscription = req.subscription;

      let count = 0;
      let limit = 0;

      if (resourceType === 'tender') {
        limit = subscription.max_tenders;
        const result = await pool.query(
          `SELECT COUNT(*) FROM tenders 
           WHERE buyer_id = $1 AND is_deleted = FALSE 
           AND created_at >= $2`,
          [userId, subscription.start_date]
        );
        count = parseInt(result.rows[0].count);
      } else if (resourceType === 'offer') {
        limit = subscription.max_offers;
        const result = await pool.query(
          `SELECT COUNT(*) FROM offers 
           WHERE supplier_id = $1 AND is_deleted = FALSE 
           AND created_at >= $2`,
          [userId, subscription.start_date]
        );
        count = parseInt(result.rows[0].count);
      }

      if (count >= limit && limit !== -1) {
        return res.status(403).json({
          success: false,
          error: `لقد وصلت إلى الحد الأقصى لـ ${resourceType === 'tender' ? 'المناقصات' : 'العروض'} في باقتك الحالية`,
          limitReached: true,
          current: count,
          limit: limit,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      logger.error('خطأ في التحقق من حدود الاشتراك:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الحدود'
      });
    }
  };
};

/**
 * Middleware للسماح بالفترة التجريبية
 */
const allowTrialPeriod = async (req, res, next) => {
  const pool = getPool();

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح'
      });
    }

    // التحقق من تاريخ إنشاء الحساب
    const userResult = await pool.query(
      'SELECT created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }

    const user = userResult.rows[0];
    const trialPeriodDays = parseInt(process.env.TRIAL_PERIOD_DAYS || '30');
    const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

    // إذا كان الحساب ضمن الفترة التجريبية
    if (accountAge <= trialPeriodDays) {
      req.isTrialUser = true;
      req.trialDaysRemaining = trialPeriodDays - accountAge;
      return next();
    }

    // بعد انتهاء الفترة التجريبية، يجب أن يكون لديه اشتراك
    return checkActiveSubscription(req, res, next);
  } catch (error) {
    logger.error('خطأ في التحقق من الفترة التجريبية:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم'
    });
  }
};

module.exports = {
  checkActiveSubscription,
  checkSubscriptionLimits,
  allowTrialPeriod
};
