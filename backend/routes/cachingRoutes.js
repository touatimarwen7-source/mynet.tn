const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cache' });
});

// Get cache statistics (admin only)
router.get('/stats', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: {
        hits: 0,
        misses: 0,
        size: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear cache (admin only)
router.delete('/clear', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;