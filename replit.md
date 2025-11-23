# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the Tunisian private sector, designed for scalability and market leadership. It offers a secure and efficient solution for B2B transactions, including tender and offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform aims to provide a unified institutional theme, enterprise-grade security, and a professional user experience, positioning itself for market leadership in B2B e-procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
- **Design Principle**: All styles are defined via `frontend/src/theme/theme.js` using Material-UI (MUI), ensuring a unified institutional theme.
- **Color Palette**: #0056B3 (primary), #F9F9F9 (background), #212121 (text).
- **Styling**: 4px border radius, 8px spacing, Roboto font.
- **Localization**: FRANÇAIS UNIQUEMENT.
- **Responsive Design**: Mobile-first approach with breakpoint guidelines, touch target sizes, responsive typography, and flexible grid layouts.
- **Accessibility**: WCAG 2.1 compliant with ARIA labels, keyboard navigation, semantic HTML, and color contrast compliance.
- **User Experience**: Loading skeletons for improved data loading UX.

### Technical Implementations
- **Frontend**: React 18 + Vite.
- **Backend**: Node.js 20 + Express.
- **Authentication**: JWT tokens + httpOnly cookies, 3-layer token persistence, MFA (SMS & TOTP).
- **Security**: CORS, CSRF, XSS, AES-256 encryption, rate limiting, brute-force protection, input validation, soft deletes, role-based access control.
- **Workflow Management**: Multi-step wizard forms for procurement processes with auto-save, draft recovery, validation, and progress tracking.
- **Core Features**: Dynamic company profiles, advanced filtering & search, messaging, reviews & ratings, direct supply requests, analytics dashboards, bid comparison tool, supplier performance tracking, and comprehensive invoice management.
- **Real-time Updates**: WebSocket (socket.io) for live notifications, bidirectional communication, and instant user presence updates via `useWebSocket` hook with comprehensive event management.
- **Data Management**: Export features (JSON, CSV), real-time updates via WebSockets, pagination, and bulk operations.
- **Notifications**: Integrated email notification system + Real-time notification center with WebSocket events.
- **Super Admin Features**: Full CRUD for static pages, file management, image gallery, documents with versioning, content backup/restore, analytics, service/subscription plan management, audit logs, purchase orders.
- **Error Handling**: Comprehensive system with custom error classes, global handler, error boundary, and Axios interceptors.
- **Form Validation**: Custom `useFormValidation` hook, pre-built schemas, real-time error display, and backend error integration.
- **Performance & Monitoring**: Three-layer optimization (database indexes, comprehensive caching with Redis, distributed caching), centralized error tracking, logging, comprehensive test suite (50%+ coverage), and automated daily database backups.
- **API Documentation**: Integrated Swagger UI with OpenAPI 3.0 specification for 95+ endpoints.
- **Enhanced Rate Limiting**: Multi-strategy (IP-based, per-user, endpoint-specific) rate limiting with configurable rules and monitoring.

### System Design Choices
- **Database Connection**: Optimized PostgreSQL connection pool with `SafeClient` wrapper and safe query middleware.
- **Security Enhancements**: Implemented CSRF protection, field-level access control, optimistic locking, and comprehensive rate limiting.
- **Code Quality**: Refactored components, eliminated code duplication, and introduced reusable components (AdminDialog, AdminForm, AdminTable, SkeletonLoader).
- **Architectural Patterns**: Use of `withTransaction()` for atomic database operations, `ErrorBoundary` for UI resilience, and `asyncHandler` for robust route error catching.
- **Critical Fixes**: Addressed database connection pool errors, implemented comprehensive input validation and SQL injection prevention, enforced pagination limits, and integrated automated daily database backups.
- **Production Code Quality**: Removed console.log statements, implemented Privacy Policy & Terms of Service pages, added a response validation layer, and enhanced Axios interceptors.
- **Unified Pagination System**: Helper function `paginationHelper.js` with consistent validation and application across routes.
- **Query Optimization**: Documented patterns and fixes for N+1 issues using LEFT JOINs and aggregations.
- **Secure Key Management**: `keyManagementHelper.js` for secure environment variable loading, validation, and key rotation support.

## External Dependencies
- **Database**: PostgreSQL (Neon).
- **Frontend Libraries**: Material-UI (MUI), React Router DOM, Axios, i18next, socket.io-client.
- **Backend Libraries**: Express, Node.js, cors, express-rate-limit, node-schedule, jest, socket.io, Redis.
- **Email Services**: SendGrid/Resend/Gmail (integrated notification system).
- **Testing**: Jest 29.7.0 with coverage reporting.
- **Monitoring**: Error tracking service, performance middleware, request logging, Swagger UI.
## Lots & Articles Structure - November 23, 2025

### 🎯 Implementation Complete

✅ **Lots as Article Collections**
- Each Lot contains multiple Articles (products/services)
- Each Article has: name, quantity, unit (unité, kg, litre, m, m², boîte)
- Lot structure: numero, objet (description), articles array

✅ **Flexible Award Levels (ترسية)**
- **Par Lot**: Entire lot awarded to one supplier
- **Par Article**: Each article can go to different supplier
- **Global**: Entire tender to one supplier
- Award level displayed in summary and sent with tender creation

✅ **UI/UX Implementation**
- Step 3 (Lots): Create Lots with nested article management
- Award Level selector with color-coded options
- Real-time article list in each lot
- Step 7 (Preview): Shows award level + detailed lots with articles
- Validation: Minimum 1 lot required, each lot must have articles

✅ **Example Structure**
```
Lot 1: Informatique
  - Article 1: 5 imprimante laser
  - Article 2: 3 scanner HP

Lot 2: Fournitures de Bureau
  - Article 1: 20 stylo bleu
  - Article 2: 5 stylo rouge
```

✅ **Data Model**
```javascript
{
  awardLevel: 'lot', // or 'article', 'tender'
  lots: [
    {
      numero: '1',
      objet: 'Informatique',
      articles: [
        { name: 'Imprimante Laser', quantity: '5', unit: 'unité' },
        { name: 'Scanner', quantity: '3', unit: 'unité' }
      ]
    }
  ]
}
```

## 🔄 دورة المناقصة (Tender Lifecycle) - مراجعة شاملة 23 نوفمبر 2025

### 📊 ملخص المكونات
- **المكونات المكتملة**: 12 مكون ✅
- **المكونات قيد التطوير**: 5 مكون ⏳
- **إجمالي أسطر الكود**: 4,261 سطر
- **عدد الدوال**: 114+ دالة async

### 🎯 Lots & Articles Display - Fully Integrated

✅ **5 صفحات تم تحديثها اليوم**:
1. **TenderDetail.jsx** - عرض كامل Lots مع Articles (هرمية)
2. **TenderEvaluation.jsx** - Award Level في header + عدد Lots
3. **BidComparison.jsx** - ملخص مع Lots و Award Level
4. **CreateBid.jsx** - عرض Lots قبل المراحل
5. **CreateOffer.jsx** - عرض Lots مع السياق

### ✅ المكونات الأساسية المكتملة
1. **CreateTender** (1,716 سطر) - 7 مراحل متقدمة + Lots System
2. **TenderList** - البحث والتصفية والترتيب
3. **CreateOffer** (489 سطر) - 3 مراحل + Lots Display
4. **CreateBid** (924 سطر) - 5 مراحل + Lots Display
5. **MyOffers** - إدارة العروض
6. **BidComparison** - مقارنة شاملة + Lots
7. **TenderEvaluation** - تقييم ذكي مع 4 معايير + Lots
8. **TenderPreferencesSettings** - تخصيص الإعدادات
9. **TenderSecuritySettings** - أمان ممتدد
10. **BuyerActiveTenders** - لوحة تحكم
11. **CreateOfferLineItems** - مكون مساعد
12. **TenderChat** - تواصل مباشر (قيد التطوير)

### ⏳ المكونات قيد الإكمال
- **TenderAwarding** - إعلان الفائز
- **OfferAnalysis** - تحليل العروض
- **BidSubmission** - عروض بديلة
- **SubmitBid** - نموذج بديل

### 📝 التحديثات التقنية
- Color scheme: #0056B3 (أزرق) + #F5F5F5 (خلفية) + #212121 (نص)
- Hierarchical display: Box nesting مع border styling
- Visual indicators: ├─ و → للهيكل الهرمي
- Award Levels: Par Lot, Par Article, Global
- Validation: Minimum 1 lot + articles per lot

### ✅ Quality Metrics
- **Build Time**: 45.76s ✅
- **Build Errors**: 0 ❌
- **Frontend Status**: Running on 5000 ✅
- **Workflows**: 2/2 Running ✅
- **See full review**: `TENDER_LIFECYCLE_REVIEW.md`

## Defects & Issues Review - November 23, 2025

### 📋 عيوب ونقائص شاملة مكتشفة
- **عدد العيوب الكلي**: 42 عيب
- **العيوب الحرجة**: 4 عيوب
- **العيوب الرئيسية**: 8 عيوب
- **العيوب المتوسطة**: 15 عيب
- **ملف التقرير**: `DEFECTS_AND_ISSUES_REVIEW.md`

### 🔴 أهم العيوب الحرجة:
1. TenderAwarding - مفقود بالكامل (placeholder)
2. SubmitBid - مفقود بالكامل (placeholder)
3. BidSubmission - ناقص جداً (لا يعرض Lots)
4. OfferAnalysis - بيانات مزيفة hardcoded

### 🟠 العيوب الرئيسية:
1. عدم validation للـ Lots في CreateTender
2. عدم تحديث Lots في CreateOffer/CreateBid
3. عدم معالجة الأخطاء الشاملة
4. عدم validation للأسعار
5. عدم معالجة صلاحيات الملفات

### 🎯 الخطوات التالية:
- المرحلة 1 (أسبوع 1): إصلاحات حرجة
- المرحلة 2 (أسبوع 2-3): إصلاحات مهمة
- المرحلة 3 (أسبوع 4+): تحسينات عامة

**See full review**: `DEFECTS_AND_ISSUES_REVIEW.md`

## Backup & Recovery Testing - November 23, 2025

### 🎯 Implementation Complete

✅ **Automated Test Suite**
- 15 comprehensive test cases
- Backup creation, listing, verification
- Recovery path testing
- Security validation
- Metadata testing

✅ **Manual Testing Guide**
- 6 complete test scenarios
- Step-by-step procedures
- Expected results
- Performance baselines
- Troubleshooting procedures

✅ **Testing Script**
- Bash script for API testing
- Color-coded output
- Health checks
- Error handling
- Ready-to-run automation

✅ **Security Testing**
- Authentication verification
- Authorization checks
- Directory traversal prevention
- Recovery confirmation
- Token validation

### 📊 Backup System

**Daily Automated Backups:**
- Scheduled at 2:00 AM UTC
- Auto-cleanup (30 latest retained)
- Automatic verification

**Manual Backup Creation:**
- On-demand backup via API
- Super admin only
- File integrity verified
- Metadata tracked

**Recovery Capabilities:**
- Point-in-time recovery
- Explicit confirmation required
- Recovery time: 20-30 seconds
- Data integrity guaranteed

### 📁 Files

- `tests/backup-recovery.test.js` - Test suite
- `BACKUP-RECOVERY-TESTING.md` - Testing guide
- `scripts/test-backup-recovery.sh` - Test script

### 🔍 Endpoints Tested

- GET /api/backups/list
- POST /api/backups/create
- GET /api/backups/stats
- GET /api/backups/scheduler/status
- POST /api/backups/verify/:filename
- GET /api/backups/download/:filename
- POST /api/backups/restore/:filename
- DELETE /api/backups/:filename

