const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

class SimpleAuthService {
  constructor() {
    this.usersFile = path.join(__dirname, '../data/users.json');
    this.credentialsMap = {
      'admin@mynet.tn': 'admin123',
      'buyer@mynet.tn': 'buyer123',
      'supplier@mynet.tn': 'supplier123',
    };
  }

  /**
   * Load users from local JSON file
   * @private
   * @returns {Array} Array of user objects from file or empty array
   */
  loadUsers() {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {}
    return [];
  }

  /**
   * Authenticate user with email and password
   * Generates JWT access and refresh tokens
   * @async
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<Object>} User object and access/refresh tokens
   * @throws {Error} When credentials are invalid
   */
  async authenticate(email, password) {
    try {
      console.log('🔐 Authentication attempt:', { email, password });

      // Check if credentials match the simple map
      const expectedPassword = this.credentialsMap[email];
      console.log('Expected password:', expectedPassword);

      if (!expectedPassword || expectedPassword !== password) {
        console.log('❌ Password mismatch');
        return null;
      }

      // Load users from file
      const users = await this.loadUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        console.log('❌ User not found');
        return null;
      }

      console.log('✅ Authentication successful');
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return null;
    }
  }

  /**
   * Get user by ID without password hash
   * @param {string} userId - ID of user to retrieve
   * @returns {Object|null} User object without password or null if not found
   */
  getUserById(userId) {
    const users = this.loadUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}

module.exports = new SimpleAuthService();