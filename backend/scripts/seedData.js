#!/usr/bin/env node

const { getPool, initializeDb } = require('../config/db');
const KeyManagementService = require('../security/KeyManagementService');

const testUsers = [
  { email: 'buyer1@test.tn', username: 'buyer1', password: 'Buyer@123456', role: 'buyer', name: 'Buyer One', company: 'Company A' },
  { email: 'buyer2@test.tn', username: 'buyer2', password: 'Buyer@123456', role: 'buyer', name: 'Buyer Two', company: 'Company B' },
  { email: 'supplier1@test.tn', username: 'supplier1', password: 'Supplier@123456', role: 'supplier', name: 'Supplier One', company: 'Supply Co A' },
  { email: 'supplier2@test.tn', username: 'supplier2', password: 'Supplier@123456', role: 'supplier', name: 'Supplier Two', company: 'Supply Co B' },
  { email: 'supplier3@test.tn', username: 'supplier3', password: 'Supplier@123456', role: 'supplier', name: 'Supplier Three', company: 'Supply Co C' },
  { email: 'admin@test.tn', username: 'admin', password: 'Admin@123456', role: 'super_admin', name: 'Admin User', company: 'Admin' },
];

const testTenders = [
  { title: 'Office Supplies Procurement', description: 'Buy office supplies for Q1 2025', budget_min: 5000, budget_max: 15000, category: 'Supplies' },
  { title: 'IT Equipment Purchase', description: 'Buy laptops and servers', budget_min: 50000, budget_max: 100000, category: 'IT' },
  { title: 'Cleaning Services', description: 'Weekly cleaning services', budget_min: 2000, budget_max: 5000, category: 'Services' },
  { title: 'Marketing Campaign', description: 'Digital marketing services', budget_min: 25000, budget_max: 50000, category: 'Marketing' },
  { title: 'Transportation Services', description: 'Employee transportation', budget_min: 10000, budget_max: 20000, category: 'Transport' },
];

async function seedData() {
  try {
    
    await initializeDb();
    const pool = getPool();
    
    // Add test users
    for (const user of testUsers) {
      const { hash, salt } = KeyManagementService.hashPassword(user.password);
      
      await pool.query(
        `INSERT INTO users (username, email, password_hash, password_salt, full_name, role, company_name, is_verified, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO NOTHING`,
        [user.username, user.email, hash, salt, user.name, user.role, user.company]
      );
    }
    
    // Get buyer user for tender creation
    const buyerResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['buyer']);
    const buyerId = buyerResult.rows[0]?.id;
    
    if (buyerId) {
      for (let i = 0; i < testTenders.length; i++) {
        const tender = testTenders[i];
        const tenderNumber = `TEND-${Date.now()}-${i}`;
        
        await pool.query(
          `INSERT INTO tenders (tender_number, title, description, category, budget_min, budget_max, currency, status, is_public, buyer_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (tender_number) DO NOTHING`,
          [tenderNumber, tender.title, tender.description, tender.category, tender.budget_min, tender.budget_max, 'TND', 'open', buyerId]
        );
      }
      
      // Add offers for each tender
      const tendersResult = await pool.query('SELECT id FROM tenders LIMIT 5');
      const suppliers = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 3', ['supplier']);
      
      for (const tender of tendersResult.rows) {
        for (let i = 0; i < 2; i++) {
          const supplier = suppliers.rows[i];
          if (supplier) {
            const offerNumber = `OFFER-${Date.now()}-${tender.id}-${i}`;
            const totalAmount = 10000 + Math.random() * 20000;
            
            await pool.query(
              `INSERT INTO offers (tender_id, supplier_id, offer_number, total_amount, currency, delivery_time, payment_terms, status, submitted_at, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               ON CONFLICT (offer_number) DO NOTHING`,
              [tender.id, supplier.id, offerNumber, totalAmount, 'TND', '30 days', 'Net 30', 'submitted']
            );
          }
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
