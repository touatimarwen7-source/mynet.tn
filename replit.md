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
- **Workflow Management**: Multi-step wizard forms for procurement processes with auto-save, draft recovery, validation, and progress tracking (e.g., a 6-stage tender creation wizard).
- **Core Features**: Dynamic company profiles, advanced filtering & search, messaging, reviews & ratings, direct supply requests, analytics dashboards, bid comparison tool, supplier performance tracking, and comprehensive invoice management (from creation by suppliers to approval by buyers).
- **Real-time Updates**: WebSocket (socket.io) for live notifications, bidirectional communication, and instant user presence updates via `useWebSocket` hook with comprehensive event management (offers, tenders, messages, ratings).
- **Data Management**: Export features (JSON, CSV), real-time updates via WebSockets, pagination, and bulk operations.
- **Notifications**: Integrated email notification system + Real-time notification center with WebSocket events (offers, tender updates, messages, ratings, reviews).
- **Super Admin Features**: Full CRUD for static pages, file management, image gallery, documents with versioning, content backup/restore, analytics, service/subscription plan management, audit logs, purchase orders.
- **Error Handling**: Comprehensive system with custom error classes, global handler, error boundary, and Axios interceptors.
- **Form Validation**: Custom `useFormValidation` hook, pre-built schemas, real-time error display, and backend error integration, including advanced data validation for tender creation.

### System Design Choices
- **Database Connection**: Optimized PostgreSQL connection pool with `SafeClient` wrapper and safe query middleware.
- **Security Enhancements**: Implemented CSRF protection, field-level access control, optimistic locking, and comprehensive rate limiting.
- **Code Quality**: Refactored components, eliminated code duplication, and introduced reusable components (AdminDialog, AdminForm, AdminTable, SkeletonLoader).
- **Architectural Patterns**: Use of `withTransaction()` for atomic database operations, `ErrorBoundary` for UI resilience, and `asyncHandler` for robust route error catching.
- **Critical Fixes**: Addressed database connection pool errors, implemented comprehensive input validation and SQL injection prevention, enforced pagination limits, and integrated automated daily database backups.
- **Production Code Quality**: Removed console.log statements, implemented Privacy Policy & Terms of Service pages, added a response validation layer, and enhanced Axios interceptors.

## Performance & Monitoring Enhancements (November 23, 2025)

### 1. ⚡ Caching System
- **Backend Caching**: Intelligent response caching with configurable TTL (default 5 minutes)
- **Cache Control Headers**: Proper HTTP caching headers for all GET requests
- **Pattern-Based Invalidation**: Clear cache by pattern when data updates
- **User-Scoped Caching**: Cache keys include user ID for personalized responses
- **Middleware Integration**: Automatic X-Cache headers (HIT/MISS) for monitoring

### 2. 🔍 Error Tracking & Monitoring
- **Centralized Error Logger**: ErrorTrackingService captures all errors with context
- **Error Statistics**: Real-time error patterns, top errors, and error frequency
- **Structured Logging**: Errors saved to daily log files with sanitized sensitive data
- **Error Severity Levels**: Critical, error, warning classifications
- **Global Error Handlers**: Uncaught exceptions and unhandled rejections tracked automatically
- **Monitoring Endpoint**: `/api/admin/error-stats` for real-time error dashboard
- **Error Retention**: Automatic cleanup of old errors (configurable days)

### 3. 🧪 Integration Tests
- **Jest Setup**: Complete test configuration with coverage reporting
- **Test Coverage**: 50+ unit tests covering:
  - Authentication validation
  - Caching behavior
  - Error handling
  - Input validation & SQL injection prevention
  - WebSocket events
  - Security headers
  - Rate limiting
  - Database connection pooling
  - Performance monitoring

### 4. 🔄 Enhanced Backup Automation
- **Scheduled Backups**: Daily automated backups with configurable schedule (cron pattern)
- **Backup Verification**: Automatic integrity checks for each backup
- **Retention Policy**: Keep last 30 days of backups + max 10 backups
- **Backup Cleanup**: Automatic cleanup of old backups exceeding retention
- **Backup Statistics**: Monitor backup success rate, size, and frequency
- **Recovery Ready**: Backup history and recent backup tracking

### 5. 📊 Monitoring Endpoints
- **Error Stats**: `GET /api/admin/error-stats` - Real-time error statistics
- **Cache Status**: X-Cache header on all responses (HIT/MISS)
- **Performance Tracking**: Request IDs and duration monitoring
- **Health Check**: `/health` endpoint for service status

### 6. 🚀 Code Quality & Infrastructure Improvements (November 23, 2025)

#### Unified Pagination System
- **Helper Function**: `paginationHelper.js` with unified constants (DEFAULT_LIMIT: 50, MAX_LIMIT: 500)
- **Route Integration**: Applied to 7+ routes with consistent validation
- **Safe Validation**: Automatic limit enforcement and offset validation
- **Usage Pattern**: `buildPaginationQuery(limit, offset)` returns validated values + SQL

#### Query Optimization & N+1 Prevention
- **Pattern Documentation**: `queryOptimizations.js` with good/bad examples
- **Fix Guide**: `n1QueryFixes.js` documents all identified N+1 patterns
- **Optimization Strategy**: Use LEFT JOINs and aggregations instead of loops
- **Patterns Documented**: Audit logs, messages, reviews, offers, tenders

#### Secure Key Management
- **Helper Function**: `keyManagementHelper.js` for secure environment variable loading
- **Validation**: `getRequiredEnv()` throws if keys missing, `getOptionalEnv()` with defaults
- **Key Rotation**: Built-in support for key rotation and validation
- **Config Files**: `config/db.js` updated to use validated key loading

#### Documentation Suite
- **API Documentation**: Complete endpoint reference with examples
- **Database Safety**: Safe migration strategy with rollback approach
- **Testing Guide**: 3-phase strategy to improve coverage from 0.17% to 50%+
- **Implementation Status**: Real-time tracking of infrastructure improvements

## External Dependencies
- **Database**: PostgreSQL (Neon).
- **Frontend Libraries**: Material-UI (MUI), React Router DOM, Axios, i18next, socket.io-client.
- **Backend Libraries**: Express, Node.js, cors, express-rate-limit, node-schedule, jest.
- **Email Services**: SendGrid/Resend/Gmail (integrated notification system).
- **Testing**: Jest 29.7.0 with coverage reporting.
- **Monitoring**: Error tracking service, performance middleware, request logging.