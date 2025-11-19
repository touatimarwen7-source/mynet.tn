const { getPool } = require('../config/db');
const KeyManagementService = require('../security/KeyManagementService');
const User = require('../models/User');

class UserService {
    async createUser(userData) {
        const pool = getPool();
        const user = new User(userData);
        
        try {
            const { hash, salt } = KeyManagementService.hashPassword(userData.password);
            
            const result = await pool.query(
                `INSERT INTO users (username, email, password_hash, password_salt, full_name, 
                 phone, role, company_name, company_registration, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id, username, email, full_name, phone, role, company_name, is_verified, is_active, created_at`,
                [user.username, user.email, hash, salt, user.full_name, user.phone, 
                 user.role, user.company_name, user.company_registration, null]
            );
            
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Username or email already exists');
            }
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async authenticateUser(email, password) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE',
                [email]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Invalid credentials');
            }
            
            const user = result.rows[0];
            const isValid = KeyManagementService.verifyPassword(
                password,
                user.password_hash,
                user.password_salt
            );
            
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
            
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            const accessToken = KeyManagementService.generateAccessToken({
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
            
            const refreshToken = KeyManagementService.generateRefreshToken({
                userId: user.id
            });
            
            const { password_hash, password_salt, ...userWithoutPassword } = user;
            
            return {
                user: userWithoutPassword,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async getUserById(userId) {
        const pool = getPool();
        
        try {
            const result = await pool.query(
                'SELECT id, username, email, full_name, phone, role, company_name, company_registration, is_verified, is_active, created_at, last_login FROM users WHERE id = $1 AND is_deleted = FALSE',
                [userId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    async updateUser(userId, updateData) {
        const pool = getPool();
        
        try {
            const fields = [];
            const values = [];
            let paramCount = 1;

            const allowedFields = ['full_name', 'phone', 'company_name', 'company_registration'];
            
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key) && updateData[key] !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(updateData[key]);
                    paramCount++;
                }
            });

            if (fields.length === 0) {
                throw new Error('No valid fields to update');
            }

            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(userId);

            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, full_name, phone, role, company_name, is_verified, is_active, updated_at`;
            const result = await pool.query(query, values);
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async getAllUsers(filters = {}) {
        const pool = getPool();
        let query = 'SELECT id, username, email, full_name, phone, role, company_name, is_verified, is_active, created_at FROM users WHERE is_deleted = FALSE';
        const params = [];
        let paramCount = 1;

        if (filters.role) {
            query += ` AND role = $${paramCount}`;
            params.push(filters.role);
            paramCount++;
        }

        if (filters.is_verified !== undefined) {
            query += ` AND is_verified = $${paramCount}`;
            params.push(filters.is_verified);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }
}

module.exports = new UserService();
