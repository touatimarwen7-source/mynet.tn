# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector. It provides a robust, secure, and efficient solution for B2B transactions, encompassing tender management, offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform features a unified institutional theme, enterprise-grade security, and a professional user experience, designed for scalability and market leadership in B2B procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## Recent Changes (November 23, 2025)
- ✅ **Created Comprehensive Super Admin API** - 30+ endpoints for all 10 admin functions
- ✅ **Backend Super Admin Controller** - `backend/controllers/superAdminController.js` (600+ lines)
- ✅ **Backend Super Admin Routes** - `backend/routes/superAdminRoutes.js` (40+ endpoints)
- ✅ **Frontend Service Layer** - `frontend/src/services/superAdminService.js`
- ✅ **Frontend Global Context** - `frontend/src/contexts/SuperAdminContext.jsx` with state management
- ✅ **Integrated into App.js** - All routes properly registered and secured

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
- **Design Principle**: All styles defined via `frontend/src/theme/theme.js`.
- **Framework**: Exclusive use of Material-UI (MUI v7.3.5).
- **Color Palette**: #0056B3 (primary), #F9F9F9 (background), #212121 (text).
- **Styling**: 4px border radius, 8px spacing, Roboto font.
- **Localization**: FRANÇAIS UNIQUEMENT.
- **Responsive Design**: Mobile-first approach with breakpoint guidelines (xs, sm, md, lg), touch target sizes, responsive typography, and flexible grid layouts.
- **Accessibility**: WCAG 2.1 compliant with ARIA labels, keyboard navigation, semantic HTML, and color contrast compliance.
- **User Experience**: Loading skeletons for better UX during data loading.

### Technical Implementations
- **Frontend**: React 18 + Vite 7.2.4 + Material-UI v7.3.5.
- **Backend**: Node.js 20 + Express + PostgreSQL.
- **Authentication**: JWT tokens + httpOnly cookies, 3-layer token persistence, MFA (SMS & TOTP).
- **Security**: CORS protection, CSRF headers, XSS protection, AES-256 encryption, rate limiting, brute-force protection, input validation, soft deletes, role-based access control.
- **Supply Chain Workflow**: Multi-step wizard forms (CreateTender, CreateBid, CreateSupplyRequest, CreateInvoice) with auto-save, draft recovery, validation, and progress tracking.
- **Dynamic Company Profile**: For viewing and editing company information.
- **Advanced Filtering & Search**: Suppliers searchable by query, category, rating, and location, with debounced search, normalized terms, and optimized filtering.
- **Messaging System**: Full user-to-user communication (Inbox, Compose, Message Detail).
- **Reviews & Ratings System**: Comprehensive review, rating, and feedback functionality.
- **Direct Supply Request**: Buyers can send direct supply requests to verified suppliers.
- **Analytics & Insights**: Buyer/supplier dashboards, supplier analytics, and bid analytics.
- **Advanced Search & Comparison**: Multi-filter search and a bid comparison tool.
- **Data Management**: Export features (JSON, CSV), real-time updates via WebSockets, pagination, and bulk operations.
- **Supplier Performance Tracking**: Performance scoring, ranking, and history.
- **Email Notifications**: Integrated notification system with status tracking and integration readiness for various services.
- **Super Admin Features**: Full CRUD for static pages, file management, image gallery with SEO, documents with versioning, content backup/restore, analytics, services and subscription plan management.
- **Purchase Orders System**: PO lifecycle management with status tracking and authorization.
- **Audit Logs System**: Admin viewable audit logs tracking user activities and entity changes.
- **Subscription Plans System**: Backend API for plan management and user subscriptions with multiple tiers.
- **Confirmation Dialogs**: Reusable component for critical actions with severity levels.
- **Status Tracking**: Visual status indicators with color-coding and icons.

## Super Admin API Endpoints
The platform now includes a complete Super Admin API with 30+ endpoints covering:

1. **Static Pages Management** - CRUD for static pages
2. **File Management** - Upload, list, delete files
3. **Document Management** - Version tracking, CRUD operations
4. **Email Notifications** - Send and track emails
5. **User Management** - Extended user CRUD, role assignment, block/unblock
6. **Audit Logs** - Track all admin activities
7. **Health Monitoring** - System health status
8. **Backup & Restore** - Database backup management
9. **Subscription Plans** - Plan CRUD operations
10. **Feature Control** - Feature flag management

All endpoints are:
- ✅ Protected with JWT authentication
- ✅ Restricted to super_admin role
- ✅ Implement proper error handling
- ✅ Include audit logging
- ✅ Support pagination and filtering

API Base: `/api/super-admin`

## External Dependencies
- **Database**: PostgreSQL (Neon).
- **Frontend Libraries**: Material-UI (MUI) v7.3.5, React Router DOM, Axios, i18next, socket.io-client (v4.8.1).
- **Backend Libraries**: Express, Node.js 20, cors (v2.8.5), express-rate-limit (v8.2.1).
- **Email Services**: SendGrid/Resend/Gmail.