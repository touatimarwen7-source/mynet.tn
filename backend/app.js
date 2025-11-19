const express = require('express');
const authRoutes = require('./routes/authRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const stripeWebhookRoutes = require('./routes/webhooks/stripeRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Running',
        message: 'MyNet.tn Procurement & Tender Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            procurement: '/api/procurement',
            admin: '/api/admin',
            search: '/api/search'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/webhooks', stripeWebhookRoutes);

const ErrorHandler = require('./middleware/errorHandler');

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

module.exports = app;