# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the Tunisian private sector, designed for scalability and market leadership. It offers a secure and efficient solution for B2B transactions, including tender and offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation. The platform provides a unified institutional theme, enterprise-grade security, and a professional user experience, aiming for market leadership in B2B e-procurement.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## System Architecture
The platform utilizes a React frontend (Vite) and a Node.js backend with a PostgreSQL database.

### UI/UX Decisions
All styles are defined via `frontend/src/theme/theme.js` using Material-UI (MUI), ensuring a unified institutional theme. The color palette uses #0056B3 (primary), #F9F9F9 (background), and #212121 (text), with a 4px border radius, 8px spacing, and Roboto font. The design is mobile-first, responsive, and WCAG 2.1 compliant with accessibility features like ARIA labels and keyboard navigation. Localization is exclusively in French, and loading skeletons are used for improved UX.

### Technical Implementations
The frontend uses React 18 + Vite, and the backend uses Node.js 20 + Express. Authentication is managed with JWT tokens, httpOnly cookies, 3-layer token persistence, and MFA. Security features include CORS, CSRF, XSS, AES-256 encryption, rate limiting, brute-force protection, input validation, soft deletes, and role-based access control. The platform supports multi-step wizard forms for procurement, dynamic company profiles, advanced filtering, messaging, reviews, direct supply requests, analytics, bid comparison, and comprehensive invoice management. Real-time updates are handled via WebSockets (socket.io) for notifications and presence. Data management includes export features (JSON, CSV), pagination, and bulk operations. A comprehensive email and real-time notification system is integrated. Super Admin features allow CRUD operations for static pages, file management, content backup/restore, analytics, service plan management, and audit logs. Error handling is robust with custom classes, global handlers, and Axios interceptors. Custom form validation includes pre-built schemas and real-time error display. Performance is optimized with database indexes, Redis caching, and a comprehensive test suite. API documentation is provided via Swagger UI with OpenAPI 3.0. Automated tender closing and opening report generation are implemented.

### Auto-Close & Opening Report System (NEW)
**Status: ✅ PRODUCTION-READY**

**Automated Tender Closing:**
- Scheduled job runs every 60 seconds via node-schedule
- Automatically closes tenders when deadline is reached
- Creates official opening report (procès-verbal) with precise timestamps
- Comprehensive audit trail and error handling

**Opening Report / Procès-Verbal (محضر الفتح):**
- Official document generated on tender closing
- Contains all submitted offers with precise submission timestamps
- Summary statistics: total offers, valid/invalid count
- Exportable as JSON/PDF for documentation
- Print-friendly Material-UI component with professional layout
- Stored in database for historical reference and compliance

**Key Components:**
- `OpeningReportService`: Handles report generation, retrieval, export
- `TenderAutoCloseJob`: Scheduled task for automatic closing
- `OpeningReport.jsx`: Frontend component for viewing/exporting reports
- `opening_reports` table: 10-column PostgreSQL table with complete audit info
- API endpoints: `/api/opening-reports/...` for CRUD operations

**Database Schema:**
```sql
CREATE TABLE opening_reports (
  id SERIAL PRIMARY KEY,
  tender_id INTEGER NOT NULL REFERENCES tenders(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  opened_by INTEGER REFERENCES users(id),
  total_offers_received INTEGER DEFAULT 0,
  total_valid_offers INTEGER DEFAULT 0,
  total_invalid_offers INTEGER DEFAULT 0,
  offers_data JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### System Design Choices
An optimized PostgreSQL connection pool with `SafeClient` and secure query middleware is used. Security is enhanced with CSRF protection, field-level access control, and optimistic locking. Code quality is maintained through refactored and reusable components. Architectural patterns include `withTransaction()` for atomic operations, `ErrorBoundary` for UI resilience, and `asyncHandler` for robust error catching. Critical fixes address database connection errors, SQL injection prevention, pagination limits, and automated daily database backups. Production code quality ensures removal of console logs, inclusion of Privacy Policy and Terms of Service, and enhanced Axios interceptors. A unified pagination system and query optimization techniques (e.g., N+1 issue resolution) are implemented. Secure key management is handled via `keyManagementHelper.js`. Validation logic, state management, and error handling are centralized. Unit options are consolidated for consistency.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **Frontend Libraries**: Material-UI (MUI), React Router DOM, Axios, i18next, socket.io-client
- **Backend Libraries**: Express, Node.js, cors, express-rate-limit, node-schedule, jest, socket.io, Redis
- **Email Services**: SendGrid/Resend/Gmail
- **Testing**: Jest
- **Monitoring**: Error tracking service, performance middleware, request logging, Swagger UI
- **Scheduler**: node-schedule (for auto-close job)

## Recent Changes (November 24, 2025)
- ✅ Auto-close mechanism: TenderAutoCloseJob scheduled to run every 60 seconds
- ✅ Opening Report system: Complete procès-verbal generation with offer timestamps
- ✅ Database: `opening_reports` table created with 10 columns
- ✅ API endpoints: 3 new routes for opening report CRUD
- ✅ Frontend: OpeningReport.jsx component with export & print functionality
- ✅ Both workflows: Backend & Frontend running successfully
- ✅ Quality: Zero errors/warnings, production-ready build
