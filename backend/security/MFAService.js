
const crypto = require('crypto');
const { getPool } = require('../config/db');

class MFAService {
    /**
     * Generate a time-based one-time password (TOTP)
     */
    generateTOTP(userId) {
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        return { code, expiresAt };
    }

    /**
     * Store MFA code for verification
     */
    async storeMFACode(userId, code, expiresAt, purpose = 'offer_opening') {
        const pool = getPool();
        
        try {
            await pool.query(
                `INSERT INTO mfa_codes (user_id, code, purpose, expires_at, is_used)
                 VALUES ($1, $2, $3, $4, FALSE)
                 ON CONFLICT (user_id, purpose) WHERE is_used = FALSE
                 DO UPDATE SET code = $2, expires_at = $4, created_at = CURRENT_TIMESTAMP`,
                [userId, code, purpose, expiresAt]
            );
            
            return true;
        } catch (error) {
            console.error("Erreur de stockage du code MFA:", error.message);
            return false;
        }
    }

    /**
     * Verify MFA code
     */
    async verifyMFACode(userId, code, purpose = 'offer_opening') {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                `SELECT * FROM mfa_codes 
                 WHERE user_id = $1 AND code = $2 AND purpose = $3 
                 AND is_used = FALSE AND expires_at > CURRENT_TIMESTAMP`,
                [userId, code, purpose]
            );

            if (result.rows.length === 0) {
                return { valid: false, message: 'Invalid or expired MFA code' };
            }

            // Mark as used
            await pool.query(
                'UPDATE mfa_codes SET is_used = TRUE WHERE id = $1',
                [result.rows[0].id]
            );

            return { valid: true, message: 'MFA verification successful' };
        } catch (error) {
            console.error("Erreur de vérification MFA:", error.message);
            return { valid: false, message: 'MFA verification failed' };
        }
    }

    /**
     * Request MFA for sensitive operation
     */
    async requestMFA(userId, purpose, channel = 'email') {
        const { code, expiresAt } = this.generateTOTP(userId);
        
        await this.storeMFACode(userId, code, expiresAt, purpose);
        
        // TODO: Send code via email/SMS
        // For now, return code for testing
        console.log(`MFA Code for user ${userId}: ${code}`);
        
        return { 
            success: true, 
            message: `MFA code sent via ${channel}`,
            expiresIn: '5 minutes'
        };
    }
}

module.exports = new MFAService();
