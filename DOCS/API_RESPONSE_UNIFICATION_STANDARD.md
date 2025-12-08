
# 📋 معيار توحيد استجابات API

## ✅ هيكل الاستجابات الناجحة

جميع الاستجابات الناجحة يجب أن تتبع الهيكل التالي:

```javascript
{
  "success": true,
  "statusCode": 200,  // أو 201 للإنشاء
  "message": "رسالة نجاح باللغة الفرنسية",
  "data": {
    // البيانات المطلوبة
  },
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

### استخدام Response Helpers

استخدم دائماً `responseHelper.js` لتوحيد الاستجابات:

```javascript
const { sendOk, sendCreated, sendNoContent } = require('../utils/responseHelper');

// للاستجابات الناجحة (200)
return sendOk(res, data, 'Message de succès');

// للموارد المنشأة (201)
return sendCreated(res, newResource, 'Ressource créée avec succès');

// للحذف الناجح (204)
return sendNoContent(res);
```

## ❌ هيكل استجابات الأخطاء

جميع استجابات الأخطاء يجب أن تتبع الهيكل التالي:

```javascript
{
  "success": false,
  "statusCode": 400,  // رمز الخطأ المناسب
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رسالة الخطأ باللغة الفرنسية",
    "details": {
      // تفاصيل إضافية عند الحاجة
    }
  },
  "timestamp": "2025-01-04T10:30:45.123Z",
  "requestId": "req_abc123",
  "path": "/api/endpoint"
}
```

### استخدام Error Response Helpers

```javascript
const {
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError
} = require('../utils/responseHelper');

// خطأ التحقق (400)
return sendValidationError(res, errors, 'Les données sont invalides');

// غير مصرح (401)
return sendUnauthorized(res, 'Token invalide ou expiré');

// محظور (403)
return sendForbidden(res, 'Accès refusé');

// غير موجود (404)
return sendNotFound(res, 'Tender');

// تعارض (409)
return sendConflict(res, 'Email déjà utilisé', { field: 'email' });

// خطأ داخلي (500)
return sendInternalError(res, 'Erreur lors du traitement');
```

## 🔧 معايير التصدير (Exports)

### ✅ التصدير الصحيح

```javascript
// Named exports (الأفضل)
module.exports = {
  verifyToken,
  checkRole,
  checkPermission
};

// أو destructuring
const { verifyToken } = require('../middleware/authMiddleware');
```

### ❌ التصدير الخاطئ

```javascript
// ❌ خطأ - لا تستخدم default export مع named imports
module.exports = authMiddleware;
const { verifyToken } = require('../middleware/authMiddleware'); // فشل

// ❌ خطأ - استيراد خاطئ
const cacheMiddleware = require('../middleware/cacheMiddleware');
// يجب أن يكون:
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
```

## 📝 قائمة مرجعية للتوحيد

عند إنشاء أو تعديل مسار API:

- [ ] استخدم `sendOk()` أو `sendCreated()` للاستجابات الناجحة
- [ ] استخدم `sendValidationError()` لأخطاء التحقق
- [ ] استخدم `sendNotFound()` للموارد غير الموجودة
- [ ] استخدم `sendInternalError()` لأخطاء الخادم
- [ ] تأكد من جميع الرسائل باللغة الفرنسية
- [ ] تأكد من استخدام `return` قبل كل استجابة
- [ ] تأكد من استيراد middleware بشكل صحيح
- [ ] استخدم `try...finally` لتحرير اتصالات قاعدة البيانات

## 🛡️ معالجة الاتصالات بقاعدة البيانات

دائماً استخدم الهيكل التالي:

```javascript
router.get('/endpoint', verifyToken, async (req, res) => {
  const pool = getPool();
  let client;
  
  try {
    client = await pool.connect();
    
    const result = await client.query('SELECT * FROM table');
    
    return sendOk(res, result.rows, 'Données récupérées avec succès');
  } catch (error) {
    console.error('Error:', error);
    return sendInternalError(res, 'Échec de la récupération des données');
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr);
      }
    }
  }
});
```

## 🔄 مثال كامل

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { sendOk, sendNotFound, sendInternalError } = require('../utils/responseHelper');
const { getPool } = require('../config/db');

router.get('/:id', 
  validateIdMiddleware('id'),
  verifyToken,
  async (req, res) => {
    const pool = getPool();
    let client;
    
    try {
      client = await pool.connect();
      
      const result = await client.query(
        'SELECT * FROM resources WHERE id = $1',
        [req.params.id]
      );
      
      if (result.rows.length === 0) {
        return sendNotFound(res, 'Ressource');
      }
      
      return sendOk(res, result.rows[0], 'Ressource récupérée avec succès');
    } catch (error) {
      console.error('Error:', error);
      return sendInternalError(res, 'Échec de la récupération');
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseErr) {
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

module.exports = router;
```
