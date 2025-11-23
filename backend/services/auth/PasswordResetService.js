/**
 * 🔐 PASSWORD RESET SERVICE
 * Secure password reset with token verification
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { withTransaction } = require('../../utils/databaseTransactions');
const { getPool } = require('../../config/db');

class PasswordResetService {
  generateResetToken() {
    return {
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
    };
  }

  async requestReset(email) {
    return withTransaction(async (client) => {
      const userResult = await client.query(
        `SELECT id, name FROM users WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return { success: true, message: 'If email exists, reset link sent' };
      }

      const { id: userId } = userResult.rows[0];
      await client.query(
        `UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false`,
        [userId]
      );

      const { token, expiresAt } = this.generateResetToken();
      await client.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [userId, token, expiresAt]
      );

      return { success: true, message: 'If email exists, reset link sent' };
    });
  }

  async verifyResetToken(token) {
    const pool = getPool();
    const result = await pool.query(
      `SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1 AND used = false`,
      [token]
    );

    if (result.rows.length === 0) {
      return { valid: false, error: 'Invalid reset token' };
    }

    const { user_id, expires_at } = result.rows[0];
    if (new Date(expires_at) < new Date()) {
      return { valid: false, error: 'Reset token expired' };
    }

    return { valid: true, userId: user_id };
  }

  async resetPassword(token, newPassword) {
    return withTransaction(async (client) => {
      const tokenResult = await client.query(
        `SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1 AND used = false`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const { user_id, expires_at } = tokenResult.rows[0];
      if (new Date(expires_at) < new Date()) {
        throw new Error('Reset token expired');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [hashedPassword, user_id]);
      await client.query(`UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1`, [token]);
      await client.query(`UPDATE user_sessions SET invalidated = true WHERE user_id = $1`, [user_id]);

      return { success: true, message: 'Password reset successfully' };
    });
  }
}

module.exports = new PasswordResetService();
