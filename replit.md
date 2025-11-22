# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector, offering a robust, secure, and efficient solution for B2B transactions. Its core capabilities include tender management, offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform features a unified institutional theme, enterprise-grade security, and a professional user experience, and is designed for scalability and market leadership in B2B procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## Recent Changes (November 22, 2025)
- **100% COMPLETE French Conversion - ZERO Arabic Text Remaining**
  - Fixed ALL remaining Arabic text in admin components (ServicesManager, UserRoleManagement, ContentManager, StaticPagesManager, AdminDashboard, SuperAdminDashboard, SupplierReviews)
  - Removed Arabic locale file (`frontend/src/locales/ar/common.json`)
  - Verified platform with comprehensive grep search: ZERO Arabic characters found (✓ 0 matches)
  - All UI labels, buttons, messages, placeholders, errors, confirmations converted to French
  - All fallback data uses French text
  - All dialog titles and form labels in French
  - Fixed date formatting locales from Arabic to French where applicable
  
- **Role Selection Screen**: Initial role selection at /register with:
  - **Compte Acheteur** (Buyer Account) card with benefits and icon
  - **Compte Fournisseur** (Supplier Account) card with benefits and icon
  - Clickable cards with hover effects
  
- **Multi-Step Registration Form**: 3-phase registration form:
  - **Step 1 - Informations Générales**: Username, email, password, full name, phone
  - **Step 2 - Informations de l'Entreprise**: Company name, registration number
  - **Step 3 - Informations de l'Activité**: Company type, product range, subcategory, year founded, employees
  - MUI Stepper with progress indicator
  - Step-by-step validation before advancing
  
- **Smart Cascading Validation**: Dropdowns reset when parent selections change

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
- **Design Principle**: All styles defined via `frontend/src/theme/theme.js`.
- **Framework**: Exclusive use of Material-UI (MUI v7.3.5).
- **Color Palette**: #0056B3 (primary), #F9F9F9 (background), #212121 (text).
- **Styling**: 4px border radius, 8px spacing, Roboto font.
- **Localization**: FRANÇAIS UNIQUEMENT.
- **Registration Form**: Multi-step form with visual progress indicator (Stepper) for better UX during user onboarding.

### Technical Implementations
- **Frontend**: React 18 + Vite 7.2.4 + Material-UI v7.3.5.
- **Backend**: Node.js 20 + Express + PostgreSQL.
- **Authentication**: JWT tokens + httpOnly cookies, with enhanced 3-layer token persistence, MFA (SMS & TOTP).
- **Security**: CORS protection, CSRF headers, XSS protection, AES-256 encryption, rate limiting, brute-force protection, input validation, soft deletes for compliance, role-based access control.
- **Supply Chain Workflow**: Multi-step wizard forms for CreateTender, CreateBid, CreateSupplyRequest, and CreateInvoice, with auto-save, draft recovery, validation, and progress tracking.
- **Dynamic Company Profile**: For viewing and editing company information.
- **Advanced Filtering & Search**: Suppliers searchable by query, category, rating, and location.
- **Messaging System**: Full user-to-user communication.
- **Reviews & Ratings System**: Comprehensive review, rating, and feedback functionality with 5-star ratings.
- **Direct Supply Request**: Buyers can send direct supply requests to verified suppliers.
- **Analytics & Insights**: Buyer/supplier dashboards, supplier analytics, and bid analytics.
- **Advanced Search & Comparison**: Multi-filter search and a bid comparison tool.
- **Data Management**: Export features (JSON, CSV) and real-time updates via WebSockets.
- **Supplier Performance Tracking**: Performance scoring, ranking, and history.
- **Email Notifications**: Integrated notification system for various events.
- **Super Admin Features**: Full CRUD for static pages, file management, image gallery with SEO, documents with versioning, content backup/restore, analytics, services and subscription plan management.
- **Purchase Orders System**: PO lifecycle management from offers with status tracking and authorization (buyer-supplier only).
- **Audit Logs System**: Admin viewable audit logs tracking user activities and entity changes.
- **Subscription Plans System**: Backend API for plan management and user subscriptions with multiple tiers.

## External Dependencies
- **Database**: PostgreSQL (Neon).
- **Frontend Libraries**: Material-UI (MUI) v7.3.5, React Router DOM, Axios, i18next, socket.io-client (v4.8.1).
- **Backend Libraries**: Express, Node.js 20, cors (v2.8.5), express-rate-limit (v8.2.1).
- **Email Services**: SendGrid/Resend/Gmail.