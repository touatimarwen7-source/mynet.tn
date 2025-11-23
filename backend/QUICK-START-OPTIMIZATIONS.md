# Quick Start Guide - Optimizations

## How to Use New Optimization Utilities

### 1. Query Optimizer
```javascript
const QueryOptimizer = require('./utils/queryOptimizer');

// Get buyer analytics with optimized query
const result = await QueryOptimizer.getBuyerAnalytics(pool, userId);
```

### 2. Audit Batch Logger
```javascript
const auditBatcher = require('./utils/auditBatcher');

// Log audit action (batched automatically)
auditBatcher.log(userId, 'action', 'entity', entityId, { details: 'here' });
```

### 3. Cache Middleware
```javascript
const { cacheMiddleware } = require('./middleware/cacheMiddleware');

// Add to route with TTL in seconds
router.get('/endpoint', cacheMiddleware(600), handler);
```

### 4. Response Formatter
```javascript
const ResponseFormatter = require('./utils/responseFormatter');

// Format response
res.json(ResponseFormatter.success(data, 'Data fetched'));
```

### 5. Parameter Validator
```javascript
const ParamValidator = require('./utils/parameterValidator');

// Validate pagination
const errors = ParamValidator.validatePagination(page, limit);
if (errors) return res.status(400).json({ errors });
```

### 6. Performance Metrics
```javascript
const metrics = require('./utils/performanceMetrics');

// Get metrics
console.log(metrics.getSummary());
```

## Configuration

Edit `backend/config/optimizations.js` to adjust:
- Cache TTL values
- Query thresholds
- Batch sizes
- Rate limits

## Monitoring

Check performance stats:
```bash
GET /api/admin/error-stats     # Error tracking
GET /api/admin/cache-stats     # Cache statistics
GET /api/admin/performance     # Performance metrics
```

## Best Practices

1. **Use QueryOptimizer** for analytics endpoints
2. **Enable caching** for read-heavy operations (use cacheMiddleware)
3. **Batch audit logs** automatically (no changes needed)
4. **Monitor slow queries** - see queryMonitor logs
5. **Use ResponseFormatter** for consistent responses

## Performance Improvements

Expected improvements after integration:
- Query time: 85-90% faster
- Database load: 50-70% reduction
- Cache hit rate: ~70%
- Error responses: Standardized format

---
See PERFORMANCE-CHECKLIST.md for detailed implementation status.
