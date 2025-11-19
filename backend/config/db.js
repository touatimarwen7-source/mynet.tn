const { Pool } = require('pg');

let pool;

async function initializeDb() {
    try {
        if (!pool) {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            await pool.query('SELECT NOW()'); 
            console.log('✅ DATABASE: Connection Pool created and connected successfully to Neon PostgreSQL.');
        }
        return true;
    } catch (error) {
        console.error('❌ DATABASE ERROR: Failed to connect to Neon PostgreSQL.');
        console.error('Error Details:', error.message);
        return false;
    }
}

function getPool() {
    if (!pool) {
        throw new Error("Database Pool not initialized. Call initializeDb() first.");
    }
    return pool;
}

module.exports = {
    initializeDb,
    getPool
};
