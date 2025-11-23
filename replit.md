# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector, offering a robust, secure, and efficient solution for B2B transactions. Its core capabilities include tender management, offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform features a unified institutional theme, enterprise-grade security, and a professional user experience, and is designed for scalability and market leadership in B2B procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## Recent Changes (November 23, 2025 - SUPER ADMIN & CREATE-TENDER DEVELOPMENT)
- **✅ SUPER ADMIN DASHBOARD - COMPLETE DEVELOPMENT**
  - **Centre de Contrôle Total**: Main hub with 5-tab interface
  - **👥 Gestion des Utilisateurs et Sécurité**: Full user management with role-based CRUD
  - **📄 Gestion du Contenu Dynamique**: Static pages manager + coming soon sections
  - **🔧 Gestion des Services et Plans**: Feature flags and subscription plans management
  - **⚙️ Paramètres Système**: System configuration toggles and utilities
  - **📊 Surveillance et Analyse**: Analytics, metrics, resource monitoring, activity logs
  - **Status**: All 6 components functional and French-compliant

- **✅ CREATE-TENDER FORM ENHANCEMENT - NEW LOT/ARTICLE STEP**
  - **New Step 4 Added**: "📦 Lots et Articles" (Lot/Article Information)
  - **Features**:
    - Add/Edit/Delete lots with N°, Objet (Object), Type d'Adjudication
    - Type d'Adjudication: "Par Lot" or "Globale (Appel Entier)"
    - Table display with color-coded adjudication types
    - Consultable information sections for tender details
  - **Total Steps**: Now 9 steps (was 8)
  - **Step Sequence**: 
    1. Infos de base → 2. Classification → 3. Budget & Devise → 4. Lots et Articles (NEW)
    5. Calendrier → 6. Exigences → 7. Critères → 8. Pièces jointes → 9. Révision
  - **Status**: Fully integrated with state management and form data persistence

## Previous Recent Changes (November 23, 2025 - FINAL AUDIT)
- **✅ COMPREHENSIVE FRENCH LANGUAGE AUDIT - 100% COMPLETE**
  - **English Locale Removed**: Deleted `frontend/src/locales/en/` entire folder
  - **Language Switcher Disabled**: `LanguageSwitcher.jsx` now returns `null` (no multi-language option)
  - **7 Files Fixed**: All Arabic text converted to French
    - Inbox.jsx, MySupplyRequests.jsx, SupplierRequests.jsx, MessageDetail.jsx, Compose.jsx, PurchaseOrders.jsx
  - **30+ Text Replacements**: All UI labels, error messages, status labels, confirmations in French
  - **6 Locale Fixes**: All `ar-TN` changed to `fr-FR` for date/time formatting
  - **i18n Configuration**: French ONLY - `supportedLngs: ['fr']`, no language switching possible
  - **Arabic Key Removal**: Removed English and Arabic keys from locale JSON
  - **Browser Language**: Forced to French - `document.documentElement.lang = 'fr'`
  - **Status**: ✅ 100% French compliance achieved - See FRENCH_LANGUAGE_AUDIT.md for details

## Previous Recent Changes (November 23, 2025)
- **✅ WORKFLOW VERIFICATION COMPLETE**
  - **Phase 1 (Préparation & Création)**: Tender creation with specifications, requirements, attachments
    - Status transitions: draft → published (Ouverte)
    - Auto-publish notifications sent to suppliers
  - **Phase 2 (Soumission & Révision)**: Offer submission with deadline enforcement
    - Status transitions: published (Ouverte) → closed (Fermée) at deadline
    - AES-256 encrypted financial data
    - Auto-rejection of submissions after deadline
  - **Phase 3 (Évaluation & Adjudication)**: Offer evaluation and winner selection
    - Status transitions: closed (Fermée) → awarded (Adjugée)
    - Offer statuses: submitted (Soumis) → accepted (Gagnant) or rejected (Perdu)
    - Multi-supplier award support via line item distribution
    - Notifications sent to all stakeholders (winner + losers)
  - **Phase 4 (Après Adjudication)**: Post-award workflows
    - Purchase order generation
    - Invoice management
    - Delivery tracking (framework ready)
    - Supplier performance monitoring
  - **See WORKFLOW_VERIFICATION.md for complete details**

- **FIXED: Cursor Reset Bug in /create-tender Form**
  - Issue: Cursor would jump/reset when typing in form fields
  - Root Cause: Step components were recreating on every keystroke
  - Solution: Extracted Step components into single memoized StepContent helper
  - Result: Smooth typing without cursor position loss

- **ENHANCED: Advanced Exigences (Requirements) Step in Create Tender**
  - **Requirement Object Structure**: text, type, priority, and unique ID
  - **4 Requirement Types**: Technique, Commercial, Administratif, Légal
  - **3 Priority Levels**: Essentielle, Important, Souhaitable
  - **Visual Indicators**: Color-coded badges with left border priority indicators
  - **Complete CRUD Operations**: Add, Edit (inline with pre-filled values), Delete
  - **Enhanced UI/UX**: Multiline input, 2-column grid layout, cards display with metadata

- **100% COMPLETE French Conversion - ZERO Arabic Text Remaining**
  - Fixed ALL remaining Arabic text in admin components
  - Removed Arabic locale file
  - Verified with grep: ZERO Arabic characters found (✓ 0 matches)

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