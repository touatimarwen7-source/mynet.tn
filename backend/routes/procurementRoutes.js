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
      // Using the unified handleError which now uses errorResponse
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

module.exports = router;