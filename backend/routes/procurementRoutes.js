const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const TenderController = require('../controllers/procurement/TenderController');
const OfferController = require('../controllers/procurement/OfferController');
const InvoiceController = require('../controllers/procurement/InvoiceController');
const ReviewController = require('../controllers/procurement/ReviewController');
const TenderAwardController = require('../controllers/procurement/TenderAwardController');
const AuthorizationGuard = require('../security/AuthorizationGuard');
const { Permissions } = require('../config/Roles');
const DataFetchingOptimizer = require('../utils/dataFetchingOptimizer');
const { getPool } = require('../config/db');
const { ErrorResponseFormatter, ValidationError, NotFoundError, ServerError } = require('../utils/errorHandler');
const { validateSchema, createTenderSchema } = require('../utils/validationSchemas');

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
  return res.status(statusCode).json(ErrorResponseFormatter.error(message, statusCode));
};

// Unified success response helper
const handleSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(ErrorResponseFormatter.success(data, message, statusCode));
};

// Tenders - with validation
router.post('/tenders', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    (req, res, next) => {
      try {
        validateSchema(req.body, createTenderSchema);
        next();
      } catch (error) {
        return handleError(res, error, 400);
      }
    },
    TenderController.createTender.bind(TenderController)
);

router.get('/my-tenders',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    async (req, res) => {
      try {
        const { page, limit } = getPaginationParams(req);
        const buyerId = req.user?.userId;
        const pool = getPool();
        
        // Optimized query with selective columns and pagination
        let query = DataFetchingOptimizer.buildSelectQuery('tenders', 'tender_list');
        query += ` WHERE buyer_id = $1 AND is_deleted = FALSE`;
        
        const totalResult = await pool.query(`SELECT COUNT(*) FROM tenders WHERE buyer_id = $1 AND is_deleted = FALSE`, [buyerId]);
        const total = parseInt(totalResult.rows[0].count);
        
        query = DataFetchingOptimizer.addPagination(query, page, limit);
        const result = await pool.query(query + ` ORDER BY created_at DESC`, [buyerId]);
        
        res.json({
          tenders: result.rows,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
);

router.get('/tenders', async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const pool = getPool();
    
    // Optimized query with selective columns and pagination
    let query = DataFetchingOptimizer.buildSelectQuery('tenders', 'tender_list');
    query += ` WHERE is_deleted = FALSE AND is_public = TRUE`;
    
    const totalResult = await pool.query(`SELECT COUNT(*) FROM tenders WHERE is_deleted = FALSE AND is_public = TRUE`);
    const total = parseInt(totalResult.rows[0].count);
    
    query = DataFetchingOptimizer.addPagination(query, page, limit);
    const result = await pool.query(query + ` ORDER BY created_at DESC`);
    
    res.json({
      tenders: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tender with ID validation
router.get('/tenders/:id', validateIdMiddleware('id'), TenderController.getTender.bind(TenderController));

router.put('/tenders/:id',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.EDIT_TENDER).bind(AuthorizationGuard),
    TenderController.updateTender.bind(TenderController)
);

router.delete('/tenders/:id',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.DELETE_TENDER).bind(AuthorizationGuard),
    TenderController.deleteTender.bind(TenderController)
);

router.post('/tenders/:id/publish',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    TenderController.publishTender.bind(TenderController)
);

router.post('/tenders/:id/close',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    TenderController.closeTender.bind(TenderController)
);

// Offers
router.post('/offers',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.SUBMIT_OFFER).bind(AuthorizationGuard),
    OfferController.createOffer.bind(OfferController)
);

router.get('/offers/:id', 
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    OfferController.getOffer.bind(OfferController)
);

router.get('/tenders/:tenderId/offers',
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
        
        const totalResult = await pool.query(`SELECT COUNT(*) FROM offers WHERE tender_id = $1 AND is_deleted = FALSE`, [tenderId]);
        const total = parseInt(totalResult.rows[0].count);
        
        query = DataFetchingOptimizer.addPagination(query, page, limit);
        const result = await pool.query(query + ` ORDER BY ranking ASC NULLS LAST`, [tenderId]);
        
        res.json({
          offers: result.rows,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
);

router.get('/my-offers',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    async (req, res) => {
      try {
        const { page, limit } = getPaginationParams(req);
        const supplierId = req.user?.userId;
        const pool = getPool();
        
        let query = DataFetchingOptimizer.buildSelectQuery('offers', 'offer_list');
        query += ` WHERE supplier_id = $1 AND is_deleted = FALSE`;
        
        const totalResult = await pool.query(`SELECT COUNT(*) FROM offers WHERE supplier_id = $1 AND is_deleted = FALSE`, [supplierId]);
        const total = parseInt(totalResult.rows[0].count);
        
        query = DataFetchingOptimizer.addPagination(query, page, limit);
        const result = await pool.query(query + ` ORDER BY submitted_at DESC`, [supplierId]);
        
        res.json({
          offers: result.rows,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
);

router.post('/offers/:id/evaluate',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    OfferController.evaluateOffer.bind(OfferController)
);

router.post('/offers/:id/select-winner',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    OfferController.selectWinner.bind(OfferController)
);

router.post('/offers/:id/reject',
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.REJECT_OFFER).bind(AuthorizationGuard),
    OfferController.rejectOffer.bind(OfferController)
);

// Invoices
router.post('/invoices', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_INVOICE).bind(AuthorizationGuard),
    InvoiceController.createInvoice.bind(InvoiceController)
);

router.get('/invoices', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.VIEW_INVOICE).bind(AuthorizationGuard),
    async (req, res) => {
      try {
        const { page, limit } = getPaginationParams(req);
        const userId = req.user?.userId;
        const pool = getPool();
        
        const totalResult = await pool.query(
          `SELECT COUNT(*) FROM invoices WHERE (supplier_id = $1 OR buyer_id = $1) AND is_deleted = FALSE`,
          [userId]
        );
        const total = parseInt(totalResult.rows[0].count);
        
        const offset = (page - 1) * limit;
        const result = await pool.query(
          `SELECT id, invoice_number, po_id, amount, tax_amount, status, created_at 
           FROM invoices 
           WHERE (supplier_id = $1 OR buyer_id = $1) AND is_deleted = FALSE
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );
        
        res.json({
          invoices: result.rows,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
);

router.patch('/invoices/:id/paid', 
    validateIdMiddleware('id'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.MARK_INVOICE_AS_PAID).bind(AuthorizationGuard),
    InvoiceController.markAsPaid.bind(InvoiceController)
);

// Tender Award - Partial/Multi-Supplier Award
router.post('/tenders/:tenderId/award/initialize',
    validateIdMiddleware('tenderId'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    TenderAwardController.initializeAward.bind(TenderAwardController)
);

router.post('/tenders/:tenderId/award/line-items/:lineItemId/distribute',
    validateIdMiddleware(['tenderId', 'lineItemId']),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    TenderAwardController.distributeLineItem.bind(TenderAwardController)
);

router.get('/tenders/:tenderId/award',
    validateIdMiddleware('tenderId'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.VIEW_TENDER).bind(AuthorizationGuard),
    TenderAwardController.getAwardDetails.bind(TenderAwardController)
);

router.post('/tenders/:tenderId/award/finalize',
    validateIdMiddleware('tenderId'),
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    TenderAwardController.finalizeAward.bind(TenderAwardController)
);

module.exports = router;