/**
 * 🔐 PASSWORD RESET ROUTES
 */

const express = require('express');
const router = express.Router();
const PasswordResetService = require('../services/auth/PasswordResetService');
const EmailVerificationService = require('../services/email/EmailVerificationService');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { loginLimiter } = require('../middleware/perUserRateLimiting');
const { verifyToken } = require('../middleware/authMiddleware');

// Request password reset (rate limited)
router.post('/request', loginLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const result = await PasswordResetService.requestReset(email);
  res.json(result);
}));

// Verify reset token
router.post('/verify-token', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  const result = await PasswordResetService.verifyResetToken(token);
  res.status(result.valid ? 200 : 400).json(result);
}));

// Reset password
router.post('/reset', loginLimiter, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and password required' });
  }

  try {
    const result = await PasswordResetService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}));

// Email verification routes
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    const result = await EmailVerificationService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}));

router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const result = await EmailVerificationService.resendVerificationEmail(email);
  res.json(result);
}));

module.exports = router;
