const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool } = require('../config/db');

class KeyManagementService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || this.generateSecret();
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || this.generateSecret();
        this.TOKEN_EXPIRY = '1h';
        this.REFRESH_TOKEN_EXPIRY = '7d';
        this.algorithm = 'aes-256-gcm';
        this.masterKey = process.env.MASTER_ENCRYPTION_KEY || this.generateMasterKey();
        this.keyRotationDays = 90; // Rotate keys every 90 days
    }

    generateSecret() {
        return crypto.randomBytes(64).toString('hex');
    }

    generateMasterKey() {
        return crypto.randomBytes(32).toString('hex'); // 256 bits for AES-256
    }

    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateAccessToken(payload) {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.TOKEN_EXPIRY
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        });
    }

    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            throw new Error('Jeton d'''accès invalide ou expiré');
        }
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Jeton d'''actualisation invalide ou expiré');
        }
    }

    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return { salt, hash };
    }

    verifyPassword(password, hash, salt) {
        const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }

    encryptData(data, key) { // Changed to accept key for flexibility
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted,
            authTag: authTag.toString('hex')
        };
    }

    decryptData(encryptedData, iv, authTag, key) { // Changed to accept key for flexibility
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            Buffer.from(key, 'hex'),
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    verifyEncryption(encryptedData, key, iv, authTag) {
        try {
            const decrypted = this.decryptData(encryptedData, iv, authTag, key);
            return decrypted !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Store encryption key in database
     */
    async storeEncryptionKey(keyId, key, keyType = 'tender') {
        const pool = getPool();
        const encryptedKey = this.encryptWithMasterKey(key);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.keyRotationDays);

        try {
            await pool.query(
                `INSERT INTO encryption_keys (key_id, encrypted_key, key_type, expires_at, is_active)
                 VALUES ($1, $2, $3, $4, TRUE)`,
                [keyId, encryptedKey, keyType, expiresAt]
            );
        } catch (error) {
            console.error("Erreur lors du stockage de la clé de chiffrement:", error.message);
        }
    }

    /**
     * Retrieve active encryption key
     */
    async getEncryptionKey(keyId) {
        const pool = getPool();

        try {
            const result = await pool.query(
                'SELECT * FROM encryption_keys WHERE key_id = $1 AND is_active = TRUE',
                [keyId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const encryptedKey = result.rows[0].encrypted_key;
            return this.decryptWithMasterKey(encryptedKey);
        } catch (error) {
            console.error("Erreur lors de la récupération de la clé de chiffrement:", error.message);
            return null;
        }
    }

    /**
     * Rotate expired keys
     */
    async rotateExpiredKeys() {
        const pool = getPool();

        try {
            // Find expired keys
            const result = await pool.query(
                `SELECT * FROM encryption_keys 
                 WHERE is_active = TRUE AND expires_at < CURRENT_TIMESTAMP`
            );

            for (const keyRecord of result.rows) {
                // Mark old key as inactive
                await pool.query(
                    'UPDATE encryption_keys SET is_active = FALSE, rotated_at = CURRENT_TIMESTAMP WHERE id = $1',
                    [keyRecord.id]
                );

                // Generate new key
                const newKey = this.generateKey();
                const newKeyId = `${keyRecord.key_type}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

                await this.storeEncryptionKey(newKeyId, newKey, keyRecord.key_type);

                console.log(`Rotated key ${keyRecord.key_id} -> ${newKeyId}`);
            }

            return { success: true, rotatedCount: result.rows.length };
        } catch (error) {
            console.error("Erreur de rotation de clé:", error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Encrypt data with master key
     */
    encryptWithMasterKey(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.masterKey, 'hex'), iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return JSON.stringify({
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        });
    }

    /**
     * Decrypt data with master key
     */
    decryptWithMasterKey(encryptedData) {
        const { encrypted, iv, authTag } = JSON.parse(encryptedData);

        const decipher = crypto.createDecipheriv(
            this.algorithm,
            Buffer.from(this.masterKey, 'hex'),
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

module.exports = new KeyManagementService();