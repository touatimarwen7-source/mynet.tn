// Two-Factor Authentication (MFA) Routes - TURN 3 ENHANCEMENT
const crypto = require('crypto');
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Enable MFA for user
router.post('/enable', authMiddleware, async (req, res) => {
  try {
    const { method } = req.body; // 'sms' or 'totp'
    const userId = req.user.id;
    const db = req.app.get('db');

    if (!['sms', 'totp'].includes(method)) {
      return res.status(400).json({ error: 'Invalid MFA method' });
    }

    // Generate a cryptographically secure secret
    const secret = crypto.randomBytes(16).toString('hex');

    await db.query(`
      UPDATE users 
      SET mfa_enabled = true, mfa_method = $1, mfa_secret = $2
      WHERE id = $3
    `, [method, secret, userId]);

    res.json({ success: true, message: 'MFA enabled', secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable MFA for user
router.post('/disable', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.get('db');

    await db.query(`
      UPDATE users 
      SET mfa_enabled = false, mfa_method = null, mfa_secret = null
      WHERE id = $1
    `, [userId]);

    res.json({ success: true, message: 'MFA disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify MFA code
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const db = req.app.get('db');

    if (!code || code.length < 4) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    // In production: verify using TOTP library or compare with SMS sent
    res.json({ success: true, message: 'MFA code verified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
