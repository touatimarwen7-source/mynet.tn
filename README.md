# MyNet.tn - نظام إدارة المناقصات والمشتريات

نظام شامل لإدارة المناقصات والعطاءات والمشتريات، مبني باستخدام Node.js و Express و PostgreSQL.

## 🏗️ الهيكل المعماري

```
backend/
├── config/              # ملفات التكوين
│   ├── db.js           # إعدادات قاعدة البيانات
│   ├── Roles.js        # تعريف الأدوار والصلاحيات
│   └── schema.js       # مخطط قاعدة البيانات
│
├── security/           # طبقة الأمان
│   ├── KeyManagementService.js    # إدارة المفاتيح والتشفير
│   └── AuthorizationGuard.js      # حماية المسارات والتحقق
│
├── models/             # نماذج البيانات
│   ├── BaseEntity.js   # النموذج الأساسي
│   ├── User.js         # نموذج المستخدم
│   ├── Tender.js       # نموذج المناقصة
│   ├── Offer.js        # نموذج العرض
│   └── PurchaseOrder.js # نموذج أمر الشراء
│
├── services/           # الخدمات الأساسية
│   ├── TenderService.js        # خدمة المناقصات
│   ├── UserService.js          # خدمة المستخدمين
│   ├── OfferService.js         # خدمة العروض
│   ├── SearchService.js        # خدمة البحث
│   └── NotificationService.js  # خدمة الإشعارات
│
├── controllers/        # وحدات التحكم
│   ├── authController.js              # التسجيل والدخول
│   ├── procurement/
│   │   ├── TenderController.js        # إدارة المناقصات
│   │   └── OfferController.js         # إدارة العروض
│   └── admin/
│       └── AdminController.js         # لوحة الإدارة
│
├── routes/             # المسارات
│   ├── authRoutes.js           # مسارات المصادقة
│   ├── procurementRoutes.js    # مسارات المشتريات
│   ├── adminRoutes.js          # مسارات الإدارة
│   └── searchRoutes.js         # مسارات البحث
│
├── middleware/         # الوسائط
│   └── errorHandler.js
│
├── utils/              # الأدوات المساعدة
│   └── validators.js
│
├── app.js              # تطبيق Express
└── server.js           # نقطة الدخول الرئيسية
```

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js (v14 أو أحدث)
- PostgreSQL (Neon أو أي قاعدة بيانات PostgreSQL)
- npm أو yarn

### التثبيت

1. استنساخ المشروع:
```bash
git clone <repository-url>
cd mynet-tn-backend
```

2. تثبيت الحزم:
```bash
npm install
```

3. إعداد متغيرات البيئة:
```bash
cp .env.example .env
```

4. تحديث ملف `.env` بمعلومات قاعدة البيانات الخاصة بك:
```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
PORT=5000
```

5. تشغيل الخادم:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📋 الأدوار والصلاحيات

### الأدوار المتاحة:

1. **Admin** - مدير النظام
   - جميع الصلاحيات

2. **Buyer** - المشتري
   - إنشاء وإدارة المناقصات
   - مراجعة وتقييم العروض
   - إنشاء أوامر الشراء

3. **Supplier** - المورد
   - عرض المناقصات
   - تقديم العروض
   - عرض أوامر الشراء

4. **Accountant** - المحاسب
   - عرض التقارير والمعلومات
   - إدارة الفواتير

5. **Viewer** - مشاهد
   - عرض المعلومات فقط

## 🔌 API Endpoints

### المصادقة (Authentication)

```
POST   /api/auth/register          # تسجيل مستخدم جديد
POST   /api/auth/login             # تسجيل الدخول
POST   /api/auth/refresh-token     # تحديث التوكن
GET    /api/auth/profile           # عرض الملف الشخصي
PUT    /api/auth/profile           # تحديث الملف الشخصي
```

### المناقصات (Tenders)

```
POST   /api/procurement/tenders              # إنشاء مناقصة
GET    /api/procurement/tenders              # عرض جميع المناقصات
GET    /api/procurement/tenders/:id          # عرض مناقصة محددة
PUT    /api/procurement/tenders/:id          # تحديث مناقصة
DELETE /api/procurement/tenders/:id          # حذف مناقصة
POST   /api/procurement/tenders/:id/publish  # نشر مناقصة
POST   /api/procurement/tenders/:id/close    # إغلاق مناقصة
```

### العروض (Offers)

```
POST   /api/procurement/offers                    # تقديم عرض
GET    /api/procurement/offers/:id                # عرض عرض محدد
GET    /api/procurement/tenders/:tenderId/offers  # عروض مناقصة محددة
GET    /api/procurement/my-offers                 # عروضي
POST   /api/procurement/offers/:id/evaluate       # تقييم عرض
POST   /api/procurement/offers/:id/select-winner  # اختيار العرض الفائز
POST   /api/procurement/offers/:id/reject         # رفض عرض
```

### الإدارة (Admin)

```
GET    /api/admin/users            # عرض جميع المستخدمين
GET    /api/admin/users/:id        # عرض مستخدم محدد
GET    /api/admin/statistics       # إحصائيات النظام
POST   /api/admin/users/:id/verify # تفعيل مستخدم
PUT    /api/admin/users/:id/toggle-status # تغيير حالة المستخدم
```

### البحث (Search)

```
GET    /api/search/tenders         # البحث في المناقصات
GET    /api/search/suppliers       # البحث في الموردين
```

## 🔒 الأمان

- **JWT Authentication**: مصادقة باستخدام JSON Web Tokens
- **Password Hashing**: تشفير كلمات المرور باستخدام PBKDF2
- **Role-Based Access Control (RBAC)**: التحكم في الوصول حسب الأدوار
- **Data Encryption**: تشفير البيانات الحساسة

## 💾 قاعدة البيانات

### الجداول الرئيسية:

- **users**: المستخدمون
- **tenders**: المناقصات
- **offers**: العروض
- **purchase_orders**: أوامر الشراء
- **invoices**: الفواتير
- **notifications**: الإشعارات
- **messages**: الرسائل
- **reviews**: التقييمات

## 📦 الحزم المستخدمة

- **express**: إطار عمل الويب
- **pg**: عميل PostgreSQL
- **jsonwebtoken**: JWT للمصادقة
- **dotenv**: إدارة متغيرات البيئة
- **nodemon**: إعادة التشغيل التلقائي (للتطوير)

## 🧪 الاختبار

```bash
# تشغيل الخادم في وضع التطوير
npm run dev

# اختبار endpoint معين باستخدام curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

## 📝 أمثلة الاستخدام

### تسجيل مستخدم جديد:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "supplier1",
    "email": "supplier@example.com",
    "password": "securepassword",
    "full_name": "شركة التوريدات المتقدمة",
    "phone": "+216 12345678",
    "role": "supplier",
    "company_name": "Advanced Supplies Co.",
    "company_registration": "REG123456"
  }'
```

### تسجيل الدخول:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier@example.com",
    "password": "securepassword"
  }'
```

### إنشاء مناقصة:

```bash
curl -X POST http://localhost:5000/api/procurement/tenders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "توريد أجهزة كمبيوتر",
    "description": "مناقصة لتوريد 50 جهاز كمبيوتر",
    "category": "technology",
    "budget_min": 50000,
    "budget_max": 75000,
    "deadline": "2025-12-31T23:59:59Z"
  }'
```

## 🌟 الميزات المستقبلية

- [ ] نظام الدفع الإلكتروني
- [ ] تكامل مع أنظمة ERP
- [ ] نظام الدردشة الفورية
- [ ] تقارير تحليلية متقدمة
- [ ] نظام التقييمات والمراجعات
- [ ] إشعارات بريد إلكتروني وSMS
- [ ] تطبيق الهاتف المحمول

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

## 👥 المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request للمساهمة في المشروع.

## 📞 الدعم

للدعم والاستفسارات، يرجى التواصل عبر:
- البريد الإلكتروني: support@mynet.tn
- الموقع: https://mynet.tn

---

تم التطوير بـ ❤️ من أجل مجتمع المناقصات والمشتريات في تونس
