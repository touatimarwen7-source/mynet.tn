const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const TenderController = require('../controllers/procurement/TenderController');
const OfferController = require('../controllers/procurement/OfferController');
const PurchaseOrderController = require('../controllers/procurement/PurchaseOrderController');
const InvoiceController = require('../controllers/procurement/InvoiceController');
const ReviewController = require('../controllers/procurement/ReviewController');
const TenderAwardController = require('../controllers/procurement/TenderAwardController');
const AuthorizationGuard = require('../security/AuthorizationGuard');
const { Permissions } = require('../config/Roles');
const DataFetchingOptimizer = require('../utils/dataFetchingOptimizer');
const { getPool } = require('../config/db');
const {
  ErrorResponseFormatter,
  ValidationError,
  NotFoundError,
  ServerError,
} = require('../utils/errorHandler');
const { validateSchema, createTenderSchema } = require('../utils/validationSchemas');
const { errorResponse } = require('../middleware/errorResponseFormatter'); // Added errorResponse formatter

// Pagination helper
const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
  return { page, limit };
};

// Unified error response helper
const handleError = (res, error, statusCode = 500) => {
  const message = error.message || 'An error occurred';
  const errorCode = error.code || 'ERROR';
  // Using the new errorResponse formatter
  return errorResponse(res, message, statusCode, errorCode);
};

// Unified success response helper
const handleSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(ErrorResponseFormatter.success(data, message, statusCode));
};

// Middleware to validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  if ((page && isNaN(parseInt(page))) || (limit && isNaN(parseInt(limit)))) {
    return errorResponse(res, 'Invalid pagination parameters', 400);
  }
  next();
};

// ========== DASHBOARD STATS (must be before parameterized routes) ==========

// Supplier Dashboard Stats
router.get(
  '/supplier/dashboard-stats',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const supplierId = req.user?.id;
      const pool = getPool();

      if (!supplierId) {
        console.error('Supplier dashboard stats: User not authenticated');
        return errorResponse(res, 'User not authenticated', 401);
      }

      console.log('Fetching dashboard stats for supplier:', supplierId);

      const statsQuery = `
        SELECT 
          COUNT(DISTINCT o.id) FILTER (WHERE o.is_deleted = FALSE) as total_offers,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'accepted' AND o.is_deleted = FALSE) as accepted_offers,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('open', 'published') AND t.is_deleted = FALSE) as available_tenders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending' AND o.is_deleted = FALSE) as pending_offers,
          COALESCE(SUM(po.total_amount) FILTER (WHERE po.status = 'confirmed' AND po.is_deleted = FALSE), 0) as total_revenue
        FROM offers o
        LEFT JOIN tenders t ON o.tender_id = t.id
        LEFT JOIN purchase_orders po ON o.id = po.offer_id
        WHERE o.supplier_id = $1
      `;

      const result = await pool.query(statsQuery, [supplierId]);
      const stats = result.rows[0];

      const response = {
        success: true,
        totalOffers: parseInt(stats.total_offers) || 0,
        acceptedOffers: parseInt(stats.accepted_offers) || 0,
        availableTenders: parseInt(stats.available_tenders) || 0,
        pendingOffers: parseInt(stats.pending_offers) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0
      };

      console.log('Supplier dashboard stats response:', response);
      return res.json(response);
    } catch (error) {
      console.error('Supplier dashboard stats error:', error);
      return handleError(res, error, 500);
    }
  }
);

// Buyer Dashboard Stats
router.get(
  '/buyer/dashboard-stats',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const buyerId = req.user?.id;
      const pool = getPool();

      if (!buyerId) {
        console.error('Dashboard stats: User not authenticated');
        return errorResponse(res, 'User not authenticated', 401);
      }

      console.log('Fetching dashboard stats for buyer:', buyerId);

      const statsQuery = `
        SELECT 
          COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('open', 'published') AND t.is_deleted = FALSE) as active_tenders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.is_deleted = FALSE) as total_offers,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'closed' AND t.is_deleted = FALSE) as completed_tenders,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending' AND o.is_deleted = FALSE) as pending_evaluations
        FROM tenders t
        LEFT JOIN offers o ON t.id = o.tender_id
        WHERE t.buyer_id = $1
      `;

      const result = await pool.query(statsQuery, [buyerId]);
      const stats = result.rows[0];

      const response = {
        success: true,
        activeTenders: parseInt(stats.active_tenders) || 0,
        totalOffers: parseInt(stats.total_offers) || 0,
        completedTenders: parseInt(stats.completed_tenders) || 0,
        pendingEvaluations: parseInt(stats.pending_evaluations) || 0
      };

      console.log('Dashboard stats response:', response);
      return res.json(response);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return handleError(res, error, 500);
    }
  }
);

// ========== TENDERS CRUD ==========
// Tenders - with validation
router.post(
  '/tenders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
  (req, res, next) => {
    try {
      validateSchema(req.body, createTenderSchema);
      next();
    } catch (error) {
      console.error('Tender validation error:', error);
      return handleError(res, error, 400);
    }
  },
  TenderController.createTender.bind(TenderController)
);

router.get(
  '/my-tenders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const buyerId = req.user?.id;
      const pool = getPool();

      if (!buyerId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      // Simple direct query for tenders
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const result = await pool.query(
        `SELECT id, title, description, budget_min, budget_max, currency, status, is_public, created_at, updated_at
           FROM tenders WHERE (buyer_id = $1 OR is_public = TRUE) AND is_deleted = FALSE
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [buyerId, parseInt(limit), offset]
      );

      const totalResult = await pool.query(
        `SELECT COUNT(*) FROM tenders WHERE (buyer_id = $1 OR is_public = TRUE) AND is_deleted = FALSE`,
        [buyerId]
      );
      const total = parseInt(totalResult.rows[0].count);

      res.json({
        tenders: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      // Using the unified handleError which now uses errorResponse
      handleError(res, error, 500);
    }
  }
);

// GET /procurement/tenders - Get all tenders (with pagination)
router.get('/tenders', validatePagination, async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const pool = getPool();

    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM tenders WHERE is_deleted = FALSE AND is_public = TRUE`
    );
    const total = parseInt(totalResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      `SELECT id, tender_number, title, category, budget_min, budget_max, deadline, status, is_public, buyer_id, created_at
       FROM tenders
       WHERE is_deleted = FALSE AND is_public = TRUE
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      tenders: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    // Using the unified handleError which now uses errorResponse
    handleError(res, error, 500);
  }
});

// Get single tender with ID validation
router.get(
  '/tenders/:id',
  validateIdMiddleware('id'),
  TenderController.getTender.bind(TenderController)
);

router.put(
  '/tenders/:id',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.EDIT_TENDER).bind(AuthorizationGuard),
  TenderController.updateTender.bind(TenderController)
);

router.delete(
  '/tenders/:id',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.DELETE_TENDER).bind(AuthorizationGuard),
  TenderController.deleteTender.bind(TenderController)
);

router.post(
  '/tenders/:id/publish',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
  TenderController.publishTender.bind(TenderController)
);

router.post(
  '/tenders/:id/close',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
  TenderController.closeTender.bind(TenderController)
);

// Offers
router.post(
  '/offers',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.SUBMIT_OFFER).bind(AuthorizationGuard),
  OfferController.createOffer.bind(OfferController)
);

router.get(
  '/offers/:id',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  OfferController.getOffer.bind(OfferController)
);

router.get(
  '/tenders/:tenderId/offers',
  validateIdMiddleware('tenderId'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_OFFER).bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { page, limit } = getPaginationParams(req);
      const pool = getPool();

      let query = DataFetchingOptimizer.buildSelectQuery('offers', 'offer_list');
      query += ` WHERE tender_id = $1 AND is_deleted = FALSE`;

      const totalResult = await pool.query(
        `SELECT COUNT(*) FROM offers WHERE tender_id = $1 AND is_deleted = FALSE`,
        [tenderId]
      );
      const total = parseInt(totalResult.rows[0].count);

      query = DataFetchingOptimizer.addPagination(query, page, limit);
      const result = await pool.query(query + ` ORDER BY ranking ASC NULLS LAST`, [tenderId]);

      res.json({
        offers: result.rows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      // Using the unified handleError which now uses errorResponse
      handleError(res, error, 500);
    }
  }
);

router.get(
  '/my-offers',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const supplierId = req.user?.id;
      const pool = getPool();

      if (!supplierId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      // Simple direct query for offers
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const result = await pool.query(
        `SELECT id, tender_id, supplier_id, price, currency, quantity, description, status, ranking, submitted_at, updated_at
           FROM offers WHERE supplier_id = $1 AND is_deleted = FALSE
           ORDER BY submitted_at DESC LIMIT $2 OFFSET $3`,
        [supplierId, parseInt(limit), offset]
      );

      const totalResult = await pool.query(
        `SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = FALSE`,
        [supplierId]
      );
      const total = parseInt(totalResult.rows[0].count);

      res.json({
        offers: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      // Using the unified handleError which now uses errorResponse
      handleError(res, error, 500);
    }
  }
);

router.post(
  '/offers/:id/evaluate',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
  OfferController.evaluateOffer.bind(OfferController)
);

router.post(
  '/offers/:id/select-winner',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
  OfferController.selectWinner.bind(OfferController)
);

router.post(
  '/offers/:id/reject',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.REJECT_OFFER).bind(AuthorizationGuard),
  OfferController.rejectOffer.bind(OfferController)
);

// Purchase Orders - Buyer sends to winning supplier(s)
router.post(
  '/purchase-orders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.CREATE_PURCHASE_ORDER).bind(AuthorizationGuard),
  PurchaseOrderController.createPurchaseOrder.bind(PurchaseOrderController)
);

router.get(
  '/purchase-orders/:id',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  PurchaseOrderController.getPurchaseOrder.bind(PurchaseOrderController)
);

router.get(
  '/my-purchase-orders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_PURCHASE_ORDER).bind(AuthorizationGuard),
  PurchaseOrderController.getMyPurchaseOrders.bind(PurchaseOrderController)
);

router.get(
  '/received-purchase-orders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_PURCHASE_ORDER).bind(AuthorizationGuard),
  PurchaseOrderController.getReceivedPurchaseOrders.bind(PurchaseOrderController)
);

router.put(
  '/purchase-orders/:id/status',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  PurchaseOrderController.updatePurchaseOrderStatus.bind(PurchaseOrderController)
);

// Invoices - Supplier creates after delivery
router.post(
  '/invoices',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.SUBMIT_OFFER).bind(AuthorizationGuard),
  InvoiceController.createInvoice.bind(InvoiceController)
);

router.get(
  '/invoices/:id',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  InvoiceController.getInvoice.bind(InvoiceController)
);

router.get(
  '/my-invoices',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  InvoiceController.getMyInvoices.bind(InvoiceController)
);

router.get(
  '/received-invoices',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_PURCHASE_ORDER).bind(AuthorizationGuard),
  InvoiceController.getReceivedInvoices.bind(InvoiceController)
);

router.put(
  '/invoices/:id/status',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_PURCHASE_ORDER).bind(AuthorizationGuard),
  InvoiceController.updateInvoiceStatus.bind(InvoiceController)
);

router.post(
  '/invoices/:id/upload',
  validateIdMiddleware('id'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  InvoiceController.uploadInvoiceDocument.bind(InvoiceController)
);

// Tender Award - Partial/Multi-Supplier Award
router.post(
  '/tenders/:tenderId/award/initialize',
  validateIdMiddleware('tenderId'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
  TenderAwardController.initializeAward.bind(TenderAwardController)
);

router.post(
  '/tenders/:tenderId/award/line-items/:lineItemId/distribute',
  validateIdMiddleware(['tenderId', 'lineItemId']),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
  TenderAwardController.distributeLineItem.bind(TenderAwardController)
);

router.get(
  '/tenders/:tenderId/award',
  validateIdMiddleware('tenderId'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.VIEW_TENDER).bind(AuthorizationGuard),
  TenderAwardController.getAwardDetails.bind(TenderAwardController)
);

router.post(
  '/tenders/:tenderId/award/finalize',
  validateIdMiddleware('tenderId'),
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
  TenderAwardController.finalizeAward.bind(TenderAwardController)
);

// Added new tender lifecycle routes
router.get('/tenders/:id/with-offers', AuthorizationGuard.authenticateToken.bind(AuthorizationGuard), validateIdMiddleware('id'), TenderController.getTenderWithOffers);
router.get('/tenders/:id/statistics', AuthorizationGuard.authenticateToken.bind(AuthorizationGuard), validateIdMiddleware('id'), TenderController.getTenderStatistics);
router.post('/tenders/:id/award', AuthorizationGuard.authenticateToken.bind(AuthorizationGuard), validateIdMiddleware('id'), TenderController.awardTender);

// Supplier trends endpoint (temporal analytics)
router.get(
  '/supplier/trends',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const supplierId = req.user?.id;
      const { period = '6 months' } = req.query;
      const pool = getPool();

      if (!supplierId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const trendsQuery = `
        SELECT 
          DATE_TRUNC('month', o.submitted_at) as month,
          COUNT(DISTINCT o.id) as offers_submitted,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'accepted') as offers_accepted,
          AVG(o.total_amount) as avg_offer_price,
          SUM(CASE WHEN o.status = 'accepted' THEN o.total_amount ELSE 0 END) as revenue_generated
        FROM offers o
        WHERE o.supplier_id = $1 
          AND o.is_deleted = FALSE
          AND o.submitted_at >= NOW() - INTERVAL '${period}'
        GROUP BY DATE_TRUNC('month', o.submitted_at)
        ORDER BY month DESC
        LIMIT 12
      `;

      const result = await pool.query(trendsQuery, [supplierId]);

      return res.json({
        success: true,
        trends: result.rows.map(row => ({
          month: row.month,
          offersSubmitted: parseInt(row.offers_submitted) || 0,
          offersAccepted: parseInt(row.offers_accepted) || 0,
          avgOfferPrice: parseFloat(row.avg_offer_price) || 0,
          revenueGenerated: parseFloat(row.revenue_generated) || 0
        }))
      });
    } catch (error) {
      console.error('Supplier trends error:', error);
      return handleError(res, error, 500);
    }
  }
);

// Buyer trends endpoint (temporal analytics)
router.get(
  '/buyer/trends',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const buyerId = req.user?.id;
      const { period = '6 months' } = req.query;
      const pool = getPool();

      if (!buyerId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const trendsQuery = `
        SELECT 
          DATE_TRUNC('month', t.created_at) as month,
          COUNT(DISTINCT t.id) as tenders_created,
          COUNT(DISTINCT o.id) as offers_received,
          AVG(o.total_amount) as avg_offer_price,
          SUM(t.budget_max) as total_budget_allocated
        FROM tenders t
        LEFT JOIN offers o ON t.id = o.tender_id AND o.is_deleted = FALSE
        WHERE t.buyer_id = $1 
          AND t.is_deleted = FALSE
          AND t.created_at >= NOW() - INTERVAL '${period}'
        GROUP BY DATE_TRUNC('month', t.created_at)
        ORDER BY month DESC
        LIMIT 12
      `;

      const result = await pool.query(trendsQuery, [buyerId]);

      return res.json({
        success: true,
        trends: result.rows.map(row => ({
          month: row.month,
          tendersCreated: parseInt(row.tenders_created) || 0,
          offersReceived: parseInt(row.offers_received) || 0,
          avgOfferPrice: parseFloat(row.avg_offer_price) || 0,
          totalBudgetAllocated: parseFloat(row.total_budget_allocated) || 0
        }))
      });
    } catch (error) {
      console.error('Buyer trends error:', error);
      return handleError(res, error, 500);
    }
  }
);

// Supplier recent orders endpoint
router.get(
  '/supplier/recent-orders',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const supplierId = req.user?.id;
      const { limit = 10 } = req.query;
      const pool = getPool();

      if (!supplierId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const ordersQuery = `
        SELECT 
          po.id,
          po.po_number,
          po.total_amount,
          po.status,
          po.delivery_date,
          po.created_at,
          u.company_name as buyer_name,
          t.title as tender_title
        FROM purchase_orders po
        JOIN offers o ON po.offer_id = o.id
        JOIN tenders t ON o.tender_id = t.id
        JOIN users u ON t.buyer_id = u.id
        WHERE o.supplier_id = $1 AND po.is_deleted = FALSE
        ORDER BY po.created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(ordersQuery, [supplierId, parseInt(limit)]);

      return res.json({
        success: true,
        orders: result.rows
      });
    } catch (error) {
      console.error('Supplier recent orders error:', error);
      return handleError(res, error, 500);
    }
  }
);

// Supplier analytics endpoint
router.get(
  '/supplier/analytics',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const supplierId = req.user?.id;
      const pool = getPool();

      if (!supplierId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const analyticsQuery = `
        WITH offer_stats AS (
          SELECT 
            COUNT(DISTINCT o.id) as total_offers,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'accepted') as accepted_offers,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'rejected') as rejected_offers,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_offers,
            AVG(o.total_amount) as avg_offer_amount,
            MIN(o.total_amount) as min_offer_amount,
            MAX(o.total_amount) as max_offer_amount,
            COUNT(DISTINCT o.tender_id) as unique_tenders
          FROM offers o
          WHERE o.supplier_id = $1 AND o.is_deleted = FALSE
        ),
        revenue_stats AS (
          SELECT 
            COALESCE(SUM(po.total_amount), 0) as total_revenue,
            COALESCE(AVG(po.total_amount), 0) as avg_order_value,
            COUNT(DISTINCT po.id) as total_orders
          FROM purchase_orders po
          JOIN offers o ON po.offer_id = o.id
          WHERE o.supplier_id = $1 AND po.is_deleted = FALSE
        ),
        review_stats AS (
          SELECT 
            COUNT(DISTINCT r.id) as total_reviews,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) FILTER (WHERE r.rating >= 4) as positive_reviews
          FROM reviews r
          WHERE r.reviewed_user_id = $1 AND r.is_deleted = FALSE
        )
        SELECT * FROM offer_stats, revenue_stats, review_stats
      `;

      const result = await pool.query(analyticsQuery, [supplierId]);
      const analytics = result.rows[0];

      const winRate = analytics.total_offers > 0 
        ? ((analytics.accepted_offers / analytics.total_offers) * 100).toFixed(2)
        : 0;

      return res.json({
        success: true,
        analytics: {
          totalOffers: parseInt(analytics.total_offers) || 0,
          acceptedOffers: parseInt(analytics.accepted_offers) || 0,
          rejectedOffers: parseInt(analytics.rejected_offers) || 0,
          pendingOffers: parseInt(analytics.pending_offers) || 0,
          winRate: parseFloat(winRate),
          avgOfferAmount: parseFloat(analytics.avg_offer_amount) || 0,
          minOfferAmount: parseFloat(analytics.min_offer_amount) || 0,
          maxOfferAmount: parseFloat(analytics.max_offer_amount) || 0,
          uniqueTenders: parseInt(analytics.unique_tenders) || 0,
          totalRevenue: parseFloat(analytics.total_revenue) || 0,
          avgOrderValue: parseFloat(analytics.avg_order_value) || 0,
          totalOrders: parseInt(analytics.total_orders) || 0,
          totalReviews: parseInt(analytics.total_reviews) || 0,
          avgRating: parseFloat(analytics.avg_rating) || 0,
          positiveReviews: parseInt(analytics.positive_reviews) || 0
        }
      });
    } catch (error) {
      console.error('Supplier analytics error:', error);
      return handleError(res, error, 500);
    }
  }
);

// Buyer analytics endpoint
router.get(
  '/buyer/analytics',
  AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
  async (req, res) => {
    try {
      const buyerId = req.user?.id;
      const pool = getPool();

      if (!buyerId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const analyticsQuery = `
        WITH tender_stats AS (
          SELECT 
            COUNT(DISTINCT t.id) as total_tenders,
            COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'published') as published_tenders,
            COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'open') as open_tenders,
            COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'closed') as closed_tenders,
            COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'awarded') as awarded_tenders,
            COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'draft') as draft_tenders,
            SUM(t.budget_max) as total_budget,
            AVG(t.budget_max) as avg_budget
          FROM tenders t
          WHERE t.buyer_id = $1 AND t.is_deleted = FALSE
        ),
        offer_stats AS (
          SELECT 
            COUNT(DISTINCT o.id) as total_offers,
            COUNT(DISTINCT o.supplier_id) as unique_suppliers,
            AVG(o.total_amount) as avg_offer_amount,
            MIN(o.total_amount) as min_offer_amount,
            MAX(o.total_amount) as max_offer_amount,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'accepted') as accepted_offers,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'rejected') as rejected_offers,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_offers
          FROM offers o
          JOIN tenders t ON o.tender_id = t.id
          WHERE t.buyer_id = $1 AND o.is_deleted = FALSE
        ),
        time_stats AS (
          SELECT 
            AVG(EXTRACT(EPOCH FROM (t.deadline - t.publish_date))/86400) as avg_tender_duration_days
          FROM tenders t
          WHERE t.buyer_id = $1 AND t.is_deleted = FALSE 
            AND t.publish_date IS NOT NULL AND t.deadline IS NOT NULL
        )
        SELECT * FROM tender_stats, offer_stats, time_stats
      `;

      const result = await pool.query(analyticsQuery, [buyerId]);
      const analytics = result.rows[0];

      return res.json({
        success: true,
        analytics: {
          totalTenders: parseInt(analytics.total_tenders) || 0,
          publishedTenders: parseInt(analytics.published_tenders) || 0,
          openTenders: parseInt(analytics.open_tenders) || 0,
          closedTenders: parseInt(analytics.closed_tenders) || 0,
          awardedTenders: parseInt(analytics.awarded_tenders) || 0,
          draftTenders: parseInt(analytics.draft_tenders) || 0,
          totalOffers: parseInt(analytics.total_offers) || 0,
          uniqueSuppliers: parseInt(analytics.unique_suppliers) || 0,
          avgOfferAmount: parseFloat(analytics.avg_offer_amount) || 0,
          minOfferAmount: parseFloat(analytics.min_offer_amount) || 0,
          maxOfferAmount: parseFloat(analytics.max_offer_amount) || 0,
          acceptedOffers: parseInt(analytics.accepted_offers) || 0,
          rejectedOffers: parseInt(analytics.rejected_offers) || 0,
          pendingOffers: parseInt(analytics.pending_offers) || 0,
          totalBudget: parseFloat(analytics.total_budget) || 0,
          avgBudget: parseFloat(analytics.avg_budget) || 0,
          avgTenderDuration: parseFloat(analytics.avg_tender_duration_days) || 0
        }
      });
    } catch (error) {
      console.error('Buyer analytics error:', error);
      return handleError(res, error, 500);
    }
  }
);

module.exports = router;