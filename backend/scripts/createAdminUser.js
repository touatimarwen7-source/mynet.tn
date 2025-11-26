#!/usr/bin/env node

const { getPool } = require('../config/db');
const KeyManagementService = require('../security/KeyManagementService');

async function createAdminUser() {
  const pool = getPool();
  
  try {
    
    const adminData = {
      username: 'admin',
      email: 'admin@mynet.tn',
      password: 'Admin@MyNet.2025',
      full_name: 'Administrateur MyNet',
      phone: '+216 12 345 678',
      role: 'super_admin',
      company_name: 'MyNet.tn'
    };
    
    // Hash password using KeyManagementService
    const { hash, salt } = KeyManagementService.hashPassword(adminData.password);
    
    // Check if admin already exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminData.email]
    );
    
    if (checkResult.rows.length > 0) {
      return;
    }
    
    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, password_salt, full_name, 
       phone, role, company_name, is_verified, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE, NULL)
       RETURNING id, username, email, role, created_at`,
      [adminData.username, adminData.email, hash, salt, adminData.full_name, 
       adminData.phone, adminData.role, adminData.company_name]
    );
    
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
