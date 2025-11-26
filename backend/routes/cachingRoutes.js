/**
 * Caching Management Routes
 * API endpoints for cache control and monitoring
 * 
 * @module cachingRoutes
 */

const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const queryCacheManager = require('../utils/queryCacheManager');
const performanceOptimizer = require('../utils/performanceOptimizer');

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = queryCacheManager.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/cache/clear
 * Clear all cache (admin only)
 */
router.delete('/clear', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    queryCacheManager.clear();
    queryCacheManager.resetStats();

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cache/invalidate
 * Invalidate cache by pattern (admin only)
 */
router.post('/invalidate', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { pattern } = req.body;
    if (!pattern) {
      return res.status(400).json({ success: false, error: 'Pattern required' });
    }

    const invalidated = queryCacheManager.invalidatePattern(pattern);

    res.json({
      success: true,
      message: `Invalidated ${invalidated} cache entries matching '${pattern}'`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

// 📊 CACHE STATISTICS ENDPOINT
app.get('/api/cache/stats', (req, res) => {
  try {
    const cacheManager = require('../utils/redisCache').getCacheManager();
    const stats = cacheManager.getStats();
    
    res.status(200).json({
      cache: stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ CACHE CLEAR ENDPOINT
app.delete('/api/cache/clear', (req, res) => {
  try {
    const cacheManager = require('../utils/redisCache').getCacheManager();
    cacheManager.clear();
    
    res.status(200).json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
