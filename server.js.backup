// server.js (Main Entry Point)
require('dotenv').config(); 
const app = require('./index'); 
const { initializeDb, getPool } = require('./db.config'); 
const { initializeSchema } = require('./db.schema'); 

const port = process.env.PORT || 3000;

async function startServer() {
    console.log('--- MyNet.tn Backend Startup ---');

    // 1. Initialize and test database connection (to Neon)
    const dbStatus = await initializeDb(); 

    if (dbStatus) {
        // 2. ONLY if DB connection is successful, initialize the tables (Schema)
        const pool = getPool();
        await initializeSchema(pool);
    } else {
        console.error('CRITICAL WARNING: Server started, but failed to connect to the database. Tables will not be created.');
    }

    // 3. Start listening for server requests
    app.listen(port, () => {
      console.log(`🚀 Server started on port ${port}`);
      console.log('Access the API on the preview tab or http://localhost:3000');
    });
}

startServer();