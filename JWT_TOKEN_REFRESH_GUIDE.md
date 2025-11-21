# JWT Token Refresh Configuration - MyNet.tn

## 🔐 نظام المصادقة والـ Token Refresh الآلي

### 📊 فترات الصلاحية

| نوع الـ Token | الصلاحية | الاستخدام | الموقع |
|-------------|---------|---------|-------|
| **Access Token** | **1 ساعة** | جميع الـ API requests | Authorization header |
| **Refresh Token** | **7 أيام** | تجديد الـ Access Token | localStorage |
| **MFA Code** | **5 دقائق** | التحقق من الـ MFA | Backend فقط |

---

## ✅ آلية التجديد التلقائي (Auto Token Refresh)

### كيفية عمل النظام:

#### 1️⃣ **User يسجل الدخول:**
```json
Request: POST /auth/login
Response: {
  "accessToken": "eyJhbGc...",      // 1 hour expiry
  "refreshToken": "eyJhbGc...",     // 7 days expiry
  "user": { ... }
}
```

#### 2️⃣ **Frontend يحفظ الـ Tokens:**
```javascript
localStorage.setItem('accessToken', accessToken);    // لـ API requests
localStorage.setItem('refreshToken', refreshToken);  // لـ Refresh mechanism
```

#### 3️⃣ **أثناء الـ API Request:**
- الـ Frontend يضيف `accessToken` في كل طلب:
  ```
  Authorization: Bearer <accessToken>
  ```

#### 4️⃣ **عند انتهاء صلاحية Access Token:**
- يحصل على 401 Unauthorized error
- الـ Interceptor يكتشف الـ 401
- يحاول تجديد الـ token تلقائياً:
  ```
  POST /auth/refresh-token
  Body: { refreshToken: "eyJhbGc..." }
  ```

#### 5️⃣ **إذا نجح التجديد:**
- ✅ يحصل على `accessToken` جديد
- ✅ يحفظه في `localStorage`
- ✅ يعيد محاولة الطلب الأصلي تلقائياً
- ✅ المستخدم لا يشعر بقطع الجلسة

#### 6️⃣ **إذا فشل التجديد:**
- ❌ الـ Refresh Token انتهت صلاحيته (> 7 أيام)
- ❌ يحذف كل الـ Tokens
- ❌ يعيد المستخدم للـ Login

---

## 🛠️ التطبيق الحالي

### Backend (Node.js):
✅ **KeyManagementService.js:**
```javascript
this.TOKEN_EXPIRY = '1h';                    // Access Token
this.REFRESH_TOKEN_EXPIRY = '7d';            // Refresh Token

generateAccessToken(payload) {
  return jwt.sign(payload, this.JWT_SECRET, {
    expiresIn: this.TOKEN_EXPIRY
  });
}

generateRefreshToken(payload) {
  return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
    expiresIn: this.REFRESH_TOKEN_EXPIRY
  });
}
```

✅ **AuthController.js:**
```javascript
async refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  try {
    const decoded = KeyManagementService.verifyRefreshToken(refreshToken);
    const user = await UserService.getUserById(decoded.userId);
    
    const newAccessToken = KeyManagementService.generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
}
```

### Frontend (React):
✅ **api.js - Response Interceptor:**
- يكتشف 401 errors تلقائياً
- يستخرج الـ refreshToken من localStorage
- يطلب accessToken جديد من `/auth/refresh-token`
- يعيد محاولة الطلب الأصلي تلقائياً
- يتعامل مع طلبات متعددة بشكل آمن (queue system)
- فقط إذا فشل يعيد المستخدم للـ login

---

## 🔄 سيناريوهات الاستخدام

### ✅ السيناريو 1: User نشط
```
0:00 -> User يسجل الدخول (accessToken = 1 hour)
0:30 -> يقوم بـ API call
0:45 -> يقوم بـ API call آخر
0:50 -> accessToken valid ✓
```

### ✅ السيناريو 2: جلسة طويلة
```
0:00 -> User يسجل الدخول
0:59 -> آخر API call
1:00 -> accessToken ينتهي
1:01 -> API call جديد
       ❌ 401 error
       ✅ Refresh token تلقائياً
       ✅ إعادة محاولة الطلب
       ✅ النتيجة تصل للـ User
```

### ❌ السيناريو 3: جلسة منتهية
```
0:00 -> User يسجل الدخول
7:01 -> Refresh token انتهت صلاحيتها
7:02 -> API call جديد
       ❌ 401 error
       ❌ refresh token expired
       ❌ يجب تسجيل الدخول مجدداً
```

---

## 🛡️ نقاط الأمان

| النقطة | التفاصيل | الحالة |
|-------|---------|-------|
| **localStorage vs Cookies** | استخدام localStorage (HTTP-Only متوفر في الإنتاج) | ✅ |
| **Token Signing** | JWT مع secret key طويل | ✅ |
| **Token Verification** | التحقق من التوقيع على السيرفر | ✅ |
| **Refresh Limit** | تجديد واحد فقط لكل 401 | ✅ |
| **Queue System** | منع طلبات تجديد متزامنة | ✅ |
| **Expiry Check** | Refresh token ينتهي بعد 7 أيام | ✅ |

---

## 📝 الملفات المرتبطة

### Backend:
- `backend/security/KeyManagementService.js` - إنشاء و التحقق من الـ tokens
- `backend/controllers/authController.js` - endpoints للـ login و refresh
- `backend/services/UserService.js` - بيانات المستخدم

### Frontend:
- `frontend/src/api.js` - Axios configuration + interceptors
- `frontend/src/pages/Login.jsx` - حفظ الـ tokens عند الدخول
- `frontend/src/pages/Profile.jsx` - استخدام الـ API

---

## 🚀 اختبار النظام

### 1️⃣ تسجيل الدخول:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2️⃣ استخدام الـ Access Token:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <accessToken>"
```

### 3️⃣ تجديد الـ Token:
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

---

## ✨ الخلاصة

✅ **النظام الحالي يوفر:**
- تجديد تلقائي للـ tokens
- عدم انقطاع الجلسة للمستخدمين النشطين
- أمان عالي مع JWT signatures
- معالجة ذكية للـ 401 errors
- دعم جلسات طويلة الأمد (حتى 7 أيام)

✅ **تجربة المستخدم:**
- بدون تقطع في الخدمة
- تسجيل دخول واحد فقط لمدة 7 أيام
- إعادة تسجيل تلقائية عند انتهاء الـ refresh token

---

**تم التطبيق**: November 21, 2025
**الإصدار**: 1.2.0 MVP+
**الحالة**: ✅ جاهز للإنتاج

