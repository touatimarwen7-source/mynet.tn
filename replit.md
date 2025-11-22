# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector. It offers a robust, secure, and efficient solution for B2B transactions with a unified institutional theme and enterprise-grade security, featuring a clean, professional user experience. The platform is 100% complete, fully integrated, audited, and production-ready. Its core capabilities include tender management, offer management, and a complete supply chain process from tender creation to invoice generation.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
- **Design Principle**: All styles defined via `frontend/src/theme/theme.js`.
- **Framework**: Exclusive use of Material-UI (MUI v7.3.5).
- **Color Palette**: #0056B3 (primary), #F9F9F9 (background), #212121 (text).
- **Styling**: 4px border radius, 8px spacing, Roboto font.
- **Localization**: Fully localized in French.

### Technical Implementations
- **Frontend**: React 18 + Vite 7.2.4 + Material-UI v7.3.5.
- **Backend**: Node.js 20 + Express + PostgreSQL.
- **Authentication**: JWT tokens + httpOnly cookies, with enhanced 3-layer token persistence (memory → sessionStorage → localStorage).
- **Security**: CSRF protection, CSP headers, XSS protection, AES-256 encryption for sensitive financial data during bid submission.
- **Supply Chain Workflow**: Implements four multi-step wizard forms: CreateTender (Buyer), CreateBid (Supplier - Secure), CreateSupplyRequest (Supplier), and CreateInvoice (Supplier). All forms feature auto-save, draft recovery, form validation, and progress tracking.
- **Dynamic Company Profile**: A `CompanyProfile.jsx` page dynamically displays company information across 7 main sections, including header, navigation, presentation, key figures, products/services, similar companies, and events.
- **Sidebar Transitions**: Smooth transitions for sidebar open/close events implemented for enhanced user experience.

### Feature Specifications
- **Admin Dashboards**: Separate Super Admin (Total Control Hub) and Admin Dashboards with granular access control for user management, content management, system configuration, monitoring, and reporting.
- **Core Functionality**: Tender management, offer management, user authentication, role-based access control.
- **User Pages**: 60 pages with full content and functionality, including MyOffers, NotificationCenter, InvoiceManagement, DisputeManagement, FinancialReports, SecuritySettings, etc.
- **Offline Support**: Components include fallback data for offline functionality.

### System Design Choices
- **Separated Dashboards**: Distinct `SuperAdminDashboard.jsx` and `AdminDashboard.jsx` for granular access control.
- **Token Management**: Robust `tokenManager.js` for persistent and secure token handling.
- **Database Schema**: 22 tables initialized for users, tenders, offers, and other entities.
- **API Endpoints**: Defined for supply requests and invoices (GET, POST, PUT).
- **Draft Storage**: Unique keys for localStorage drafts (e.g., `bidDraft_{tenderId}`).

## External Dependencies
- **Database**: PostgreSQL (Neon), with an optimized connection pool (max 20, idle 60s).
- **Frontend Libraries**: Material-UI (MUI) v7.3.5.
- **Backend Libraries**: Express.