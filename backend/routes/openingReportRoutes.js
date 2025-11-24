const express = require('express');
const router = express.Router();
const OpeningReportService = require('../services/OpeningReportService');

// Optional authentication middleware (use if exists)
let authenticate = (req, res, next) => next();
try {
  const authMiddleware = require('../middleware/authMiddleware');
  authenticate = authMiddleware.authenticate || authMiddleware;
} catch (e) {
  console.log('⚠️  Authentication middleware not found, routes will be public');
}

/**
 * GET /api/opening-reports/tenders/:tenderId/opening-report
 * Get opening report for a specific tender
 */
router.get('/tenders/:tenderId/opening-report', async (req, res) => {
  try {
    const { tenderId } = req.params;

    if (!tenderId || isNaN(tenderId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tender ID must be a valid number' 
      });
    }

    const report = await OpeningReportService.getOpeningReportByTenderId(parseInt(tenderId, 10));
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Opening report not found for this tender' 
      });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('[OpeningReportRoutes] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch opening report' 
    });
  }
});

/**
 * GET /api/opening-reports/my-opening-reports
 * Get all opening reports for the logged-in buyer
 */
router.get('/my-opening-reports', authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pagination parameters' 
      });
    }

    const reports = await OpeningReportService.getOpeningReportsByBuyer(
      req.user.userId,
      page,
      limit
    );

    res.status(200).json({ 
      success: true, 
      count: reports.length, 
      page,
      limit,
      reports 
    });
  } catch (error) {
    console.error('[OpeningReportRoutes] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch opening reports' 
    });
  }
});

/**
 * GET /api/opening-reports/:reportId/export
 * Export opening report in specified format
 */
router.get('/:reportId/export', authenticate, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format = 'json' } = req.query;

    if (!reportId || isNaN(reportId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report ID must be a valid number' 
      });
    }

    const validFormats = ['json', 'pdf'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid format. Supported: ${validFormats.join(', ')}` 
      });
    }

    const result = await OpeningReportService.exportOpeningReport(
      parseInt(reportId, 10),
      format
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="opening-report-${reportId}-${Date.now()}.${format}"`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('[OpeningReportRoutes] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to export opening report' 
    });
  }
});

module.exports = router;
