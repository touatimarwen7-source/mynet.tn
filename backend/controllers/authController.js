const UserService = require('../services/UserService');
const KeyManagementService = require('../security/KeyManagementService');
const SimpleAuthService = require('../services/SimpleAuthService');

/**
 * Authentication Controller
 * Handles user registration, login, token refresh, and profile management
 *
 * @class AuthController
 * @example
 * const controller = new AuthController();
 * await controller.register(req, res);
 */
class AuthController {
  /**
   * Register a new user
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.username - Username (required)
   * @param {string} req.body.email - Email address (required)
   * @param {string} req.body.password - Password (required)
   * @param {string} req.body.full_name - Full name
   * @param {string} req.body.phone - Phone number
   * @param {string} req.body.role - User role (buyer|supplier|viewer)
   * @param {string} req.body.company_name - Company name
   * @param {string} req.body.company_registration - Company registration number
   * @param {Object} res - Express response object
   * @returns {void}
   * @throws {400} If required fields are missing
   * @throws {400} If user creation fails
   * @example
   * POST /auth/register
   * {
   *   "username": "john_doe",
   *   "email": "john@example.com",
   *   "password": "SecurePass123!",
   *   "role": "supplier"
   * }
   */
  async register(req, res) {
    try {
      const {
        username,
        email,
        password,
        full_name,
        phone,
        role,
        company_name,
        company_registration,
      } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Username, email, and password are required',
        });
      }

      const user = await SimpleAuthService.register({
        username,
        email,
        password,
        full_name,
        phone,
        role: role || 'supplier',
        company_name,
        company_registration,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Authenticate user with email and password
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - User email (required)
   * @param {string} req.body.password - User password (required)
   * @param {Object} res - Express response object
   * @returns {void} Returns access token and user data
   * @throws {400} If email or password is missing
   * @throws {401} If authentication fails
   * @example
   * POST /auth/login
   * {
   *   "email": "john@example.com",
   *   "password": "SecurePass123!"
   * }
   * Response: { success: true, accessToken: "...", user: {...} }
   */
  async login(req, res) {
    try {
      console.log('🔐 Login attempt:', { email: req.body.email });
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('❌ Missing credentials');
        return res.status(400).json({
          error: 'Email and password are required',
        });
      }

      // Use SimpleAuthService for authentication
      console.log('🔍 Authenticating user...');
      const user = await SimpleAuthService.authenticate(email, password);

      if (!user) {
        console.log('❌ Authentication failed for:', email);
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }

      console.log('✅ User authenticated:', user.email);

      // Generate tokens
      const accessToken = KeyManagementService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = KeyManagementService.generateRefreshToken({
        userId: user.id,
      });

      console.log('✅ Tokens generated successfully');

      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        refreshTokenId: refreshToken,
        expiresIn: 900,
        user,
        data: user,
      });
    } catch (error) {
      console.error('❌ Login error:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: 'Authentication failed: ' + error.message,
      });
    }
  }

  /**
   * Refresh access token using refresh token
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.refreshToken - Refresh token (required)
   * @param {Object} res - Express response object
   * @returns {void} Returns new access token
   * @throws {400} If refresh token is missing
   * @throws {404} If user not found
   * @throws {403} If refresh token is invalid
   * @example
   * POST /auth/refresh-token
   * { "refreshToken": "..." }
   * Response: { success: true, accessToken: "..." }
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
        });
      }

      const decoded = KeyManagementService.verifyRefreshToken(refreshToken);

      const user = await UserService.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const newAccessToken = KeyManagementService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      res.status(403).json({
        error: 'Invalid refresh token',
      });
    }
  }

  /**
   * Get authenticated user's profile
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user from middleware
   * @param {number} req.user.id - User ID from JWT token
   * @param {Object} res - Express response object
   * @returns {void} Returns user profile data
   * @throws {404} If user not found
   * @throws {500} If database error occurs
   * @example
   * GET /auth/profile
   * Headers: { Authorization: "Bearer <token>" }
   * Response: { success: true, user: {...} }
   */
  async getProfile(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Update authenticated user's profile
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user from middleware
   * @param {number} req.user.id - User ID from JWT token
   * @param {Object} req.body - Fields to update (full_name, phone, company_name, etc.)
   * @param {Object} res - Express response object
   * @returns {void} Returns updated user profile
   * @throws {400} If update validation fails
   * @throws {500} If database error occurs
   * @example
   * PUT /auth/profile
   * Headers: { Authorization: "Bearer <token>" }
   * Body: { "full_name": "John Doe", "phone": "1234567890" }
   * Response: { success: true, user: {...} }
   */
  async updateProfile(req, res) {
    try {
      const updateData = req.body;

      const user = await UserService.updateUser(req.user.id, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
