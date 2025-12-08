/**
 * Performance Monitoring Routes
 * Endpoints to retrieve performance metrics and monitoring data
 *
 * @module performanceRoutes
 * @example
 * const performanceRoutes = require('./performanceRoutes');
 * app.use('/api/performance', performanceRoutes);
 */

const express = require('express');
const router = express.Router();

// Basic health check for this route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'performance' });
});
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const performanceMonitor = require('../utils/performanceMonitor');

/**
 * GET /api/performance/metrics
 * Get all performance metrics
 * @returns {Object} Complete metrics object
 */
router.get('/metrics', verifyToken, (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/performance/summary
 * Get performance summary (high-level overview)
 * @returns {Object} Summary report
 */
router.get('/summary', verifyToken, (req, res) => {
  try {
    const summary = performanceMonitor.getSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/performance/slow-endpoints
 * Get slowest endpoints ranked by average response time
 * @query {number} limit - Number of endpoints to return (default: 5)
 * @returns {Array} Ranked slow endpoints
 */
router.get('/slow-endpoints', verifyToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const slowEndpoints = performanceMonitor.getTopSlowEndpoints(limit);
    res.json({
      success: true,
      data: slowEndpoints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/performance/slow-monitoring
 * Get detailed slow endpoint monitoring data
 * @returns {Object} Comprehensive slow endpoint metrics
 */
router.get('/slow-monitoring', verifyToken, (req, res) => {
  try {
    const { getSlowEndpointMetrics } = require('../middleware/slowEndpointMonitor');
    const metrics = getSlowEndpointMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/performance/metrics
 * Clear all performance metrics (admin only)
 * @returns {Object} Confirmation message
 */
router.delete('/metrics', verifyToken, checkRole(['super_admin']), (req, res) => {
  try {
    performanceMonitor.clearMetrics();
    res.json({
      success: true,
      message: 'Performance metrics cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
