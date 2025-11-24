/**
 * 🔐 Security Middleware Usage Examples
 * Real-world integration patterns for MyNet.tn
 */

// ============================================================================
// EXAMPLE 1: Authentication Routes with Input Sanitization + Rate Limiting
// ============================================================================

const { authLimiter } = require('./rateLimitingConfig');
const { sanitizationMiddleware } = require('./inputSanitization');
const { tokenIntegrityMiddleware, blacklistToken } = require('./tokenIntegrityMiddleware');

// Login endpoint - rate limited + sanitized
router.post('/api/auth/login',
  authLimiter,
  sanitizationMiddleware({
    email: { type: 'email' },
    password: { type: 'string' }
  }),
  async (req, res) => {
    try {
      // Input is already sanitized
      const { email, password } = req.body;
      
      // Authenticate user
      const token = await authenticateUser(email, password);
      res.json({ success: true, token });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  }
);

// Logout endpoint - revoke token
router.post('/api/auth/logout',
  tokenIntegrityMiddleware(),
  (req, res) => {
    const token = req.headers.authorization?.substring(7);
    if (token) {
      blacklistToken(token);  // Revoke the token
    }
    res.json({ success: true, message: 'Logged out' });
  }
);

// ============================================================================
// EXAMPLE 2: Create Tender - Protected Route with Full Security
// ============================================================================

router.post('/api/procurement/tenders',
  tokenIntegrityMiddleware(['create_tender']),  // Require authentication + permission
  sanitizationMiddleware({
    title: { type: 'string' },
    description: { type: 'string' },
    budget: { type: 'number', min: 0 },
    closingDate: { type: 'string' },
    category: { type: 'string' },
    attachments: { type: 'array', itemType: 'string' }
  }),
  async (req, res) => {
    try {
      // Input is:
      // 1. Rate limited (from adaptive limiter)
      // 2. Authenticated (token validated)
      // 3. Authorized (has create_tender permission)
      // 4. Sanitized (all fields validated and cleaned)
      
      const tenderData = req.body;
      const userId = req.user.id;
      
      const tender = await createTender(userId, tenderData);
      res.json({ success: true, tender });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// EXAMPLE 3: Admin Routes with Role Verification
// ============================================================================

router.get('/api/admin/users',
  tokenIntegrityMiddleware(['admin_view_users']),  // Require admin permission
  async (req, res) => {
    try {
      // User must have admin_view_users permission
      // Token is validated and user account is confirmed active
      
      const users = await getAdminUsers();
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Edit user - requires multiple permissions
router.put('/api/admin/users/:userId',
  tokenIntegrityMiddleware(['admin_edit_users', 'admin_view_users']),
  sanitizationMiddleware({
    email: { type: 'email' },
    role: { type: 'string' },
    status: { type: 'string' }
  }),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const userData = req.body;
      
      // User must have both permissions
      const updated = await updateUser(userId, userData);
      res.json({ success: true, user: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// EXAMPLE 4: Search/Export - CPU Intensive with Special Rate Limiting
// ============================================================================

const { searchExportLimiter } = require('./rateLimitingConfig');

router.post('/api/search/tenders',
  tokenIntegrityMiddleware(),
  searchExportLimiter,  // More restrictive rate limit
  sanitizationMiddleware({
    query: { type: 'string' },
    category: { type: 'string' },
    minBudget: { type: 'number', min: 0 },
    maxBudget: { type: 'number' },
    page: { type: 'number', min: 1 }
  }),
  async (req, res) => {
    try {
      const { query, category, minBudget, maxBudget, page } = req.body;
      
      // Input is sanitized and rate limited
      const results = await searchTenders({
        query,
        category,
        minBudget,
        maxBudget,
        page
      });
      
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// EXAMPLE 5: File Upload - Restricted Rate Limit
// ============================================================================

const { uploadLimiter } = require('./rateLimitingConfig');

router.post('/api/upload',
  tokenIntegrityMiddleware(),
  uploadLimiter,  // 5 uploads per 10 minutes
  sanitizationMiddleware({
    filename: { type: 'string' },
    mimeType: { type: 'string' }
  }),
  async (req, res) => {
    try {
      // Limited to 5 uploads per 10 minutes per user
      const file = await uploadFile(req.file, req.user.id);
      res.json({ success: true, file });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// EXAMPLE 6: Payment Processing - Strict Rate Limiting
// ============================================================================

const { paymentLimiter } = require('./rateLimitingConfig');

router.post('/api/payment/process',
  tokenIntegrityMiddleware(),
  paymentLimiter,  // 5 attempts per hour
  sanitizationMiddleware({
    amount: { type: 'number', min: 0.01 },
    currency: { type: 'string' },
    orderId: { type: 'string' }
  }),
  async (req, res) => {
    try {
      // Limited to 5 payment attempts per hour per user
      const payment = await processPayment(req.body, req.user.id);
      res.json({ success: true, payment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// EXAMPLE 7: Global Setup in app.js
// ============================================================================

/*
const express = require('express');
const app = express();

// Security middleware (order matters!)
const { adaptiveRateLimiter } = require('./middleware/rateLimitingConfig');
const { securityHeadersMiddleware } = require('./middleware/securityHeadersMiddleware');
const { sanitizationMiddleware } = require('./middleware/inputSanitization');

// Apply in order:
// 1. Rate limiting first (prevent DoS)
app.use(adaptiveRateLimiter);

// 2. Security headers (browser protection)
app.use(securityHeadersMiddleware);

// 3. Input sanitization (data protection)
app.use(sanitizationMiddleware());

// Routes here...
app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
// etc...
*/

// ============================================================================
// EXAMPLE 8: Error Handling with Security Context
// ============================================================================

// Express error handler with security info
app.use((err, req, res, next) => {
  if (err.status === 429) {
    // Rate limit exceeded
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.rateLimit?.resetTime
    });
  }
  
  if (err.code === 'INVALID_INPUT') {
    // Input validation failed
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_INPUT'
    });
  }
  
  if (err.code === 'PERMISSION_DENIED') {
    // User lacks required permissions
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      code: 'PERMISSION_DENIED',
      required: err.missing
    });
  }
  
  // Generic error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// ============================================================================
// USAGE PATTERNS SUMMARY
// ============================================================================

/*
Pattern 1: Public Endpoint
  router.post('/api/public', sanitizationMiddleware({}), handler);

Pattern 2: Authenticated Endpoint
  router.post('/api/user', tokenIntegrityMiddleware(), handler);

Pattern 3: Authorization Required
  router.post('/api/admin', tokenIntegrityMiddleware(['admin_create']), handler);

Pattern 4: Input Validation
  router.post('/api/create', sanitizationMiddleware({...}), handler);

Pattern 5: Rate Limiting
  router.post('/api/search', searchExportLimiter, handler);

Pattern 6: Full Security Stack
  router.post('/api/critical',
    tokenIntegrityMiddleware(['permission']),
    sanitizationMiddleware({...}),
    rateLimit,
    handler
  );
*/

module.exports = {};
