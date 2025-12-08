/**
 * Caching Management Routes
 * API endpoints for cache control and monitoring
 *
 * @module cachingRoutes
 */

const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const queryCacheManager = require('../utils/queryCacheManager');

// Get cache statistics
router.get('/stats', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const stats = queryCacheManager.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear cache
router.delete('/clear', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    queryCacheManager.clear();
    if (queryCacheManager.resetStats) {
      queryCacheManager.resetStats();
    }
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cache/invalidate
 * Invalidate cache by pattern (admin only)
 */
router.post('/invalidate', verifyToken, checkRole(['super_admin']), (req, res) => {
  try {
    const { pattern } = req.body;
    if (!pattern) {
      return res.status(400).json({ success: false, error: 'Pattern required' });
    }

    const invalidated = queryCacheManager.invalidatePattern 
      ? queryCacheManager.invalidatePattern(pattern) 
      : 0;

    res.json({
      success: true,
      message: `Invalidated ${invalidated} cache entries matching '${pattern}'`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
