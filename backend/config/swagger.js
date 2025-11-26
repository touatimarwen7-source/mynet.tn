/**
 * Swagger/OpenAPI Configuration
 * Provides comprehensive API documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyNet.tn B2B Procurement API',
      version: '1.2.0',
      description: 'Production-ready B2B procurement platform API with enterprise security, real-time updates, and comprehensive invoice management.',
      contact: {
        name: 'MyNet.tn Support',
        email: 'support@mynet.tn'
      },
      license: {
        name: 'Proprietary',
        url: 'https://mynet.tn'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.mynet.tn',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token for authentication'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
          description: 'HTTP-only session cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'username' },
            company_name: { type: 'string', example: 'Acme Corp' },
            role: { type: 'string', enum: ['buyer', 'supplier', 'super_admin'] },
            is_verified: { type: 'boolean', example: true },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Tender: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            tender_number: { type: 'string', example: 'TEN-2025-001' },
            title: { type: 'string', example: 'Office Supplies' },
            description: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'open', 'closed', 'awarded'] },
            budget: { type: 'number', format: 'float' },
            deadline: { type: 'string', format: 'date-time' },
            buyer_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Offer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            offer_number: { type: 'string' },
            tender_id: { type: 'integer' },
            supplier_id: { type: 'integer' },
            amount: { type: 'number', format: 'float' },
            status: { type: 'string', enum: ['pending', 'evaluated', 'accepted', 'rejected'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 400 },
            message: { type: 'string' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] }
    ]
  },
  apis: [
    './routes/authRoutes.js',
    './routes/procurementRoutes.js',
    './routes/adminRoutes.js',
    './routes/messagesRoutes.js',
    './routes/purchaseOrdersRoutes.js',
    './routes/analyticsRoutes.js',
    './routes/exportRoutes.js',
    './routes/reviewsRoutes.js',
    './routes/companyProfileRoutes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
