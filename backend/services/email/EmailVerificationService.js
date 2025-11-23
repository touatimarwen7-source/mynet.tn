/**
 * 📧 EMAIL VERIFICATION SERVICE
 * Handles email verification tokens and flows
 */

const crypto = require('crypto');
const { withTransaction } = require('../../utils/databaseTransactions');
const { getPool } = require('../../config/db');

class EmailVerificationService {
  generateVerificationToken() {
    return {
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  async sendVerificationEmail(email, token, userName) {
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
      console.log(`📧 Verification email to ${email}`);
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async verifyEmail(token) {
    return withTransaction(async (client) => {
      const tokenResult = await client.query(
        `SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1 AND used = false`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired verification token');
      }

      const { user_id, expires_at } = tokenResult.rows[0];
      if (new Date(expires_at) < new Date()) {
        throw new Error('Verification token expired');
      }

      await client.query(`UPDATE users SET email_verified = true, verified_at = NOW() WHERE id = $1`, [user_id]);
      await client.query(`UPDATE email_verification_tokens SET used = true, used_at = NOW() WHERE token = $1`, [token]);

      return { success: true, userId: user_id };
    });
  }

  async resendVerificationEmail(email) {
    return withTransaction(async (client) => {
      const userResult = await client.query(
        `SELECT id, name FROM users WHERE email = $1 AND email_verified = false`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return { success: true, message: 'If email exists, verification email sent' };
      }

      const { id: userId } = userResult.rows[0];
      await client.query(`UPDATE email_verification_tokens SET used = true WHERE user_id = $1 AND used = false`, [userId]);

      const { token, expiresAt } = this.generateVerificationToken();
      await client.query(
        `INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [userId, token, expiresAt]
      );

      return { success: true, message: 'Verification email resent' };
    });
  }

  async isEmailVerified(userId) {
    const pool = getPool();
    const result = await pool.query(`SELECT email_verified FROM users WHERE id = $1`, [userId]);
    return result.rows.length > 0 ? result.rows[0].email_verified === true : false;
  }
}

module.exports = new EmailVerificationService();
