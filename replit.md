# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector. It provides a robust, secure, and efficient solution for B2B transactions, encompassing tender management, offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform features a unified institutional theme, enterprise-grade security, and a professional user experience, designed for scalability and market leadership in B2B procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
- **Design Principle**: All styles defined via `frontend/src/theme/theme.js`.
- **Framework**: Exclusive use of Material-UI (MUI v7.3.5).
- **Color Palette**: #0056B3 (primary), #F9F9F9 (background), #212121 (text).
- **Styling**: 4px border radius, 8px spacing, Roboto font.
- **Localization**: FRANÇAIS UNIQUEMENT.
- **Registration Form**: Multi-step form with visual progress indicator (Stepper).

### Technical Implementations
- **Frontend**: React 18 + Vite 7.2.4 + Material-UI v7.3.5.
- **Backend**: Node.js 20 + Express + PostgreSQL.
- **Authentication**: JWT tokens + httpOnly cookies, 3-layer token persistence, MFA (SMS & TOTP).
- **Security**: CORS protection, CSRF headers, XSS protection, AES-256 encryption, rate limiting, brute-force protection, input validation, soft deletes, role-based access control.
- **Supply Chain Workflow**: Multi-step wizard forms (CreateTender, CreateBid, CreateSupplyRequest, CreateInvoice) with auto-save, draft recovery, validation, and progress tracking.
- **Dynamic Company Profile**: For viewing and editing company information.
- **Advanced Filtering & Search**: Suppliers searchable by query, category, rating, and location.
- **Messaging System**: Full user-to-user communication.
- **Reviews & Ratings System**: Comprehensive review, rating, and feedback functionality.
- **Direct Supply Request**: Buyers can send direct supply requests to verified suppliers.
- **Analytics & Insights**: Buyer/supplier dashboards, supplier analytics, and bid analytics.
- **Advanced Search & Comparison**: Multi-filter search and a bid comparison tool.
- **Data Management**: Export features (JSON, CSV) and real-time updates via WebSockets.
- **Supplier Performance Tracking**: Performance scoring, ranking, and history.
- **Email Notifications**: Integrated notification system.
- **Super Admin Features**: Full CRUD for static pages, file management, image gallery with SEO, documents with versioning, content backup/restore, analytics, services and subscription plan management.
- **Purchase Orders System**: PO lifecycle management with status tracking and authorization.
- **Audit Logs System**: Admin viewable audit logs tracking user activities and entity changes.
- **Subscription Plans System**: Backend API for plan management and user subscriptions with multiple tiers.

## Recent Changes (November 23, 2025 - 6 MAJOR FEATURES IMPLEMENTED ✅)

### ✅ 6 New Features Completed:

1. **Confirmation Dialogs** - Safe operations with reusable ConfirmDialog component
   - Used for tender closure and other critical actions
   - Clear severity levels (warning, info, success)
   - Prevents accidental deletions

2. **Pagination** - Full-featured list pagination
   - Page size selector (10, 25, 50, 100 items per page)
   - Previous/Next navigation with page indicators
   - Item count display
   - Auto-scroll on page change

3. **Export Functionality** - Data export in multiple formats
   - JSON export for data interchange
   - CSV export for spreadsheet compatibility
   - Dynamic field mapping
   - Supports both full and filtered datasets

4. **Bid Comparison Dashboard** - New page to compare offers
   - Route: `/bid-comparison/:tenderId`
   - Displays all offers sorted by price
   - Shows supplier name, amount, delivery time, payment terms
   - Includes offer status and evaluation scores
   - Tender summary panel

5. **Status Tracking** - Visual status indicators
   - StatusBadge component with predefined statuses
   - Color-coded indicators (draft, published, awarded, etc)
   - Icons for visual recognition
   - Applied to tender listings

6. **Bulk Operations** - Select and manage multiple items
   - Checkboxes for individual and bulk selection
   - Select-all on current page option
   - Bulk export of selected tenders
   - Selection counter in banner

### Files Created:
- `frontend/src/components/ConfirmDialog.jsx` - Reusable confirmation dialog component
- `frontend/src/components/StatusBadge.jsx` - Status badge component with predefined configurations
- `frontend/src/pages/BidComparison.jsx` - Bid comparison dashboard page
- `frontend/src/utils/exportUtils.js` - Data export utilities (JSON/CSV)

### Files Updated:
- `frontend/src/pages/BuyerActiveTenders.jsx` - Integrated all 6 features into tender list
- `frontend/src/App.jsx` - Added BidComparison route

### Implementation Details:
- All components use Material-UI with theme.js styling (no inline styles)
- Full French localization
- Responsive design (mobile/tablet/desktop)
- Zero LSP errors - all code is clean and type-safe
- Pagination existing component enhanced with page size selector
- Export utilities support dynamic field mapping for flexible data export

## External Dependencies
- **Database**: PostgreSQL (Neon).
- **Frontend Libraries**: Material-UI (MUI) v7.3.5, React Router DOM, Axios, i18next, socket.io-client (v4.8.1).
- **Backend Libraries**: Express, Node.js 20, cors (v2.8.5), express-rate-limit (v8.2.1).
- **Email Services**: SendGrid/Resend/Gmail.