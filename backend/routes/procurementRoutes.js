const express = require('express');
const router = express.Router();
const TenderController = require('../controllers/procurement/TenderController');
const OfferController = require('../controllers/procurement/OfferController');
const InvoiceController = require('../controllers/procurement/InvoiceController');
const ReviewController = require('../controllers/procurement/ReviewController');
const AuthorizationGuard = require('../security/AuthorizationGuard');
const { Permissions } = require('../config/Roles');

// Tenders
router.post('/tenders', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    TenderController.createTender.bind(TenderController)
);

router.get('/tenders', TenderController.getAllTenders.bind(TenderController));

router.get('/tenders/:id', TenderController.getTender.bind(TenderController));

router.put('/tenders/:id',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.EDIT_TENDER).bind(AuthorizationGuard),
    TenderController.updateTender.bind(TenderController)
);

router.delete('/tenders/:id',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.DELETE_TENDER).bind(AuthorizationGuard),
    TenderController.deleteTender.bind(TenderController)
);

router.post('/tenders/:id/publish',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_TENDER).bind(AuthorizationGuard),
    TenderController.publishTender.bind(TenderController)
);

router.post('/tenders/:id/close',
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
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    OfferController.getOffer.bind(OfferController)
);

router.get('/tenders/:tenderId/offers',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.VIEW_OFFER).bind(AuthorizationGuard),
    OfferController.getOffersByTender.bind(OfferController)
);

router.get('/my-offers',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    OfferController.getMyOffers.bind(OfferController)
);

router.post('/offers/:id/evaluate',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    OfferController.evaluateOffer.bind(OfferController)
);

router.post('/offers/:id/select-winner',
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.APPROVE_OFFER).bind(AuthorizationGuard),
    OfferController.selectWinner.bind(OfferController)
);

router.post('/offers/:id/reject',
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
    InvoiceController.getMyInvoices.bind(InvoiceController)
);

router.patch('/invoices/:id/paid', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.MARK_INVOICE_AS_PAID).bind(AuthorizationGuard),
    InvoiceController.markAsPaid.bind(InvoiceController)
);

// Reviews
router.post('/reviews', 
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requirePermission(Permissions.CREATE_REVIEW).bind(AuthorizationGuard),
    ReviewController.createReview.bind(ReviewController)
);

router.get('/reviews/user/:userId', 
    ReviewController.getUserReviews.bind(ReviewController)
);

module.exports = router;