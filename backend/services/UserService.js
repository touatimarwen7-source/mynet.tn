const { getPool } = require('../config/db');
const KeyManagementService = require('../security/KeyManagementService');
const User = require('../models/User');
const DataMapper = require('../helpers/DataMapper');
const {
  validateSchema,
  updateUserRoleSchema,
  blockUserSchema,
} = require('../utils/validationSchemas');
const { logger } = require('../utils/logger');

class UserService {
  /**
   * Creates a new user with password hashing and validation
   * Handles duplicate email/username with proper error messages
   * @async
   * @param {Object} userData - User details (username, email, password, full_name, phone, role, company info)
   * @returns {Promise<Object>} Created user object (without password hash/salt)
   * @throws {Error} If username/email already exists or database operation fails
   */
  async createUser(userData) {
    // Input validation is handled at controller level for password strength
    const pool = getPool();

    // Map frontend data to database schema
    const mappedData = DataMapper.mapUser(userData);
    const user = new User(mappedData);

    try {
      const { hash, salt } = KeyManagementService.hashPassword(userData.password);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, password_salt, full_name, 
                 phone, role, company_name, company_registration, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id, username, email, full_name, phone, role, company_name, is_verified, is_active, created_at`,
        [
          user.username,
          user.email,
          hash,
          salt,
          user.full_name,
          user.phone,
          user.role,
          user.company_name,
          user.company_registration,
          null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Username or email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Authenticates a user with email and password
   * Verifies credentials, generates JWT tokens, updates last_login asynchronously
   * Includes connection timeout to prevent hanging
   * @async
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Object with user (without password), accessToken, and refreshToken
   * @throws {Error} If credentials are invalid or authentication fails
   */
  async authenticateUser(email, password) {
    const pool = getPool();
    const startTime = Date.now();

    try {
      // ✅ OPTIMIZATION: Use connection with timeout and select only needed fields
      const client = await Promise.race([
        pool.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000)),
      ]);

      try {
        const result = await client.query(
          'SELECT id, username, email, password_hash, password_salt, role, is_active, is_deleted FROM users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE LIMIT 1',
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

        // ✅ UPDATE AND FETCH IN BACKGROUND (non-blocking)
        // Don't wait for this - it's not critical for login response
        client
          .query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])
          .catch(() => {});

        const accessToken = KeyManagementService.generateAccessToken({
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });

        const refreshToken = KeyManagementService.generateRefreshToken({
          userId: user.id,
        });

        const { password_hash, password_salt, is_deleted, ...userWithoutPassword } = user;

        const duration = Date.now() - startTime;
        if (duration > 500) {
          logger.warn('Slow authentication', { duration, email });
        }

        return {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
          expiresIn: 900,
        };
      } finally {
        client.release();
      }
    } catch (error) {
      const errorMsg = error?.message || 'Authentication failed';
      logger.error('Authentication error', { email, error: errorMsg });
      throw new Error(errorMsg);
    }
  }

  /**
   * Retrieves a user by ID with public profile information
   * Excludes sensitive fields (password hashes, deleted flags)
   * @async
   * @param {string} userId - The ID of the user to fetch
   * @returns {Promise<Object|null>} User object (public fields only) or null if not found
   * @throws {Error} If database query fails
   */
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

  /**
   * Updates user profile information with field validation
   * Only allows updating specific whitelisted fields for security
   * Ignores role/admin changes to prevent privilege escalation
   * @async
   * @param {string} userId - The ID of the user to update
   * @param {Object} updateData - Fields to update, only these are allowed:
   *   - full_name: User's full name
   *   - phone: Contact phone number
   *   - company_name: Company/organization name
   *   - company_registration: Company registration number
   * @returns {Promise<Object>} Updated user object with public fields only
   * @throws {Error} If no valid fields provided, user not found, or database operation fails
   * @example
   * const updated = await updateUser('user-123', {
   *   full_name: 'Ahmed Ben Ali',
   *   phone: '+216 12 345 678',
   *   company_name: 'Tech Solutions SARL'
   * });
   */
  async updateUser(userId, updateData) {
    const pool = getPool();

    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['full_name', 'phone', 'company_name', 'company_registration'];

      Object.keys(updateData).forEach((key) => {
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

  /**
   * Retrieves all users with optional filtering by role and verification status
   * Includes timeout protection to prevent hanging queries
   * Returns maximum 1000 users ordered by creation date DESC
   * @async
   * @param {Object} filters - Filter options (role, is_verified)
   * @returns {Promise<Array>} Array of user objects
   * @throws {Error} If database connection fails or query fails
   */
  async getAllUsers(filters = {}) {
    const pool = getPool();
    let query =
      'SELECT id, username, email, full_name, phone, role, company_name, is_verified, is_active, created_at FROM users WHERE is_deleted = FALSE';
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

    query += ' ORDER BY created_at DESC LIMIT 1000';

    try {
      // ✅ FIX: Use connection with timeout to prevent hanging
      const client = await Promise.race([
        pool.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        ),
      ]);

      try {
        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }
}

module.exports = new UserService();
