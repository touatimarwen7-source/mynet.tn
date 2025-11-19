const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class KeyManagementService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || this.generateSecret();
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || this.generateSecret();
        this.TOKEN_EXPIRY = '1h';
        this.REFRESH_TOKEN_EXPIRY = '7d';
    }

    generateSecret() {
        return crypto.randomBytes(64).toString('hex');
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
            throw new Error('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
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

    encryptData(data) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(this.JWT_SECRET, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted
        };
    }

    decryptData(encryptedData, iv) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(this.JWT_SECRET, 'salt', 32);
        const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

module.exports = new KeyManagementService();
