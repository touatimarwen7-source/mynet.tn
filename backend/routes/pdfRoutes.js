
const express = require('express');
const router = express.Router();
const PDFController = require('../controllers/admin/PDFController');
const { verifyToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');

/**
 * @route   POST /api/pdf/generate-tender
 * @desc    Generate PDF for tender
 * @access  Private
 */
router.post(
  '/generate-tender',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new PDFController();
    return controller.generateTenderPDF(req, res);
  })
);

/**
 * @route   POST /api/pdf/generate-offer
 * @desc    Generate PDF for offer
 * @access  Private
 */
router.post(
  '/generate-offer',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new PDFController();
    return controller.generateOfferPDF(req, res);
  })
);

/**
 * @route   POST /api/pdf/generate-opening-report
 * @desc    Generate PDF for opening report
 * @access  Private
 */
router.post(
  '/generate-opening-report',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new PDFController();
    return controller.generateOpeningReportPDF(req, res);
  })
);

/**
 * @route   POST /api/pdf/generate-award
 * @desc    Generate PDF for tender award
 * @access  Private
 */
router.post(
  '/generate-award',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new PDFController();
    return controller.generateAwardPDF(req, res);
  })
);

module.exports = router;
