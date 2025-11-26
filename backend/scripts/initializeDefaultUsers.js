#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simpler password hashing (in production, use bcrypt or similar)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const defaultUsers = [
  {
    id: '1',
    email: 'admin@mynet.tn',
    password: 'Admin@MyNet.2025',
    role: 'super_admin',
    name: 'Administrateur MyNet'
  },
  {
    id: '2',
    email: 'buyer@mynet.tn',
    password: 'Buyer@Test.2025',
    role: 'buyer',
    name: 'Acheteur Test'
  },
  {
    id: '3',
    email: 'supplier@mynet.tn',
    password: 'Supplier@Test.2025',
    role: 'supplier',
    name: 'Fournisseur Test'
  }
];

const usersFile = path.join(__dirname, '../data/users.json');
const dataDir = path.join(__dirname, '../data');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users if file doesn't exist
if (!fs.existsSync(usersFile)) {
  const usersWithHashedPasswords = defaultUsers.map(user => ({
    ...user,
    password: hashPassword(user.password),
    createdAt: new Date().toISOString()
  }));
  
  fs.writeFileSync(usersFile, JSON.stringify(usersWithHashedPasswords, null, 2));
}

