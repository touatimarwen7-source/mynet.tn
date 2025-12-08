
/**
 * 🔐 AUTH MODULE
 * Modular Monolith - Authentication Domain
 */

const bcrypt = require('bcryptjs');
const { getPool } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { DomainEvents } = require('../../core/EventBus');

class AuthModule {
  constructor(dependencies) {
    this.jwtService = dependencies.jwtService;
    this.eventBus = dependencies.eventBus;
  }

  /**
   * Get database pool
   */
  getPool() {
    return getPool();
  }

  /**
   * Register new user
   */
  async register(userData) {
    const pool = this.getPool();
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, password, full_name, role, created_at) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, created_at`,
        [userData.email, hashedPassword, userData.full_name, userData.role, new Date()]
      );

      const user = result.rows[0];

      // Publish event
      this.eventBus.publish(DomainEvents.USER_REGISTERED, {
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      logger.error('Auth Module - Register failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    const pool = this.getPool();
    try {
      // Find user
      const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Publish event
      this.eventBus.publish(DomainEvents.USER_LOGGED_IN, {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      // Remove password from response
      delete user.password;

      return { user, token };
    } catch (error) {
      logger.error('Auth Module - Login failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token) {
    const pool = this.getPool();
    try {
      const decoded = this.jwtService.verifyToken(token);
      
      // Get fresh user data
      const result = await pool.query(
        `SELECT id, email, full_name, role, created_at FROM users WHERE id = $1`,
        [decoded.id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Auth Module - Verify token failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const pool = this.getPool();
    try {
      const result = await pool.query(
        `SELECT id, email, full_name, role, created_at FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Auth Module - Get user failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = AuthModule;
