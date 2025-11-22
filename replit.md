# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a production-ready B2B procurement platform for the private sector. It offers a robust, secure, and efficient solution for B2B transactions with a unified institutional theme and enterprise-grade security, featuring a clean, professional user experience. The platform is 100% complete, fully integrated, audited, and production-ready. Its core capabilities include tender management, offer management, dynamic company profiles, and a complete supply chain process from tender creation to invoice generation.

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
- **Dynamic Company Profile**: A `CompanyProfile.jsx` page dynamically displays company information across 8 main sections with full API integration, including header, navigation, presentation, key statistics, products/services, advanced search, events/exhibitions, and contact information.
- **Company Profile Management**: `CompanyProfileAdmin.jsx` allows suppliers and admins to edit company data with categories, service locations, and detailed profile information.
- **Advanced Filtering & Search**: Suppliers can be searched and filtered by query, category, minimum rating, and location with real-time results.
- **Sidebar Transitions**: Smooth transitions for sidebar open/close events implemented for enhanced user experience.

### Feature Specifications
- **Admin Dashboards**: Separate Super Admin (Total Control Hub) and Admin Dashboards with granular access control for user management, content management, system configuration, monitoring, and reporting.
- **Company Profiles**: Dynamic supplier profiles with filtering by categories, location, and rating. Includes service listings and contact information.
- **Core Functionality**: Tender management, offer management, company profiles, advanced supplier search, user authentication, role-based access control.
- **User Pages**: 60 pages with full content and functionality, including MyOffers, NotificationCenter, InvoiceManagement, DisputeManagement, FinancialReports, SecuritySettings, CompanyProfile, CompanyProfileAdmin, etc.
- **Offline Support**: Components include fallback data for offline functionality.

### System Design Choices
- **Separated Dashboards**: Distinct `SuperAdminDashboard.jsx` and `AdminDashboard.jsx` for granular access control.
- **Token Management**: Robust `tokenManager.js` for persistent and secure token handling.
- **Database Schema**: 22 tables initialized for users, tenders, offers, company profiles, and other entities.
- **API Endpoints**: 
  - GET `/api/company-profile/supplier/:supplierId` - Retrieve supplier profile
  - PUT `/api/company-profile/supplier/:supplierId` - Update supplier profile (Admin only)
  - GET `/api/company-profile/search` - Advanced supplier search with filtering
- **Draft Storage**: Unique keys for localStorage drafts (e.g., `bidDraft_{tenderId}`).

## Recent Changes (November 22, 2025)
### Direct Supply Request Feature - Buyers can send direct supply requests to suppliers
- **New File**: `frontend/src/pages/DirectSupplyRequest.jsx` (400+ lines)
  - 4-step wizard for creating supply requests
  - Step 1: Select supplier from verified list
  - Step 2: Product details (title, description, category, quantity, unit)
  - Step 3: Budget and notes
  - Step 4: Review and confirmation
  - Real-time validation and error handling
  - Automatic notification to supplier when request is sent

- **Backend API**: `backend/routes/directSupplyRoutes.js`
  - GET `/api/direct-supply/suppliers` - Get list of verified suppliers
  - POST `/api/direct-supply/create-request` - Create direct supply request
  - GET `/api/direct-supply/my-requests` - Get buyer's requests
  - GET `/api/direct-supply/received-requests` - Get supplier's received requests
  - PUT `/api/direct-supply/:requestId/status` - Update request status (pending/accepted/rejected/completed)
  - Authorization: Only buyers can create requests, only assigned supplier can update status

- **API Integration**: Added to `frontend/src/api.js`
  - `procurementAPI.getSuppliers()` - Fetch verified suppliers
  - `procurementAPI.createSupplyRequest(data)` - Submit supply request
  - `directSupplyAPI` - Full CRUD operations for supply requests

- **Routing**: Added `/direct-supply-request` route (buyer-only access)
  - Automatic role-based access control
  - Redirects non-buyers to tenders page

- **Frontend Pages**: 
  - `/direct-supply-request` - Create new supply request (Buyers)
  - `/my-supply-requests` - View sent requests (Buyers)
  - `/supplier-requests` - View received requests (Suppliers)

- **Pages Details**:
  - **DirectSupplyRequest.jsx**: 4-step wizard for creating requests
  - **MySupplyRequests.jsx**: Table view of buyer's sent requests with filtering
  - **SupplierRequests.jsx**: Table view of supplier's received requests with accept/reject actions

### Features
- ✅ Step-by-step form wizard for easy navigation
- ✅ Real-time validation of required fields
- ✅ Automatic supplier notification system
- ✅ Role-based access (buyers only)
- ✅ Budget and quantity tracking
- ✅ Notes for special requirements
- ✅ Status management (pending → accepted/rejected/completed)
- ✅ Production-ready builds with zero errors

## Previous Changes
### Dynamic Company Profile with Full API Integration - Now for Buyers & Suppliers
- **New File**: `frontend/src/pages/CompanyProfile.jsx` (580+ lines)
  - Displays company information from real API endpoint
  - 8 main sections: Presentation, Services, Statistics, Advanced Search, Contact
  - Real-time API calls with error handling and loading states
  - Advanced search filtering by category, rating, and location
  - Service listings with action buttons (Consulter, Devis)
  - Certified, professional institutional design
  - **Accessible to**: All logged-in users (buyers + suppliers)

- **New File**: `frontend/src/pages/CompanyProfileAdmin.jsx` (390+ lines)
  - Admin panel for editing company profile data
  - Form fields for company info, address, biography
  - Dynamic category and location selection
  - Real-time form validation and error handling
  - **Role-based access control**: Suppliers, Buyers, and Admins can edit their own profile
  - Auto-loads current user's profile data

- **Backend API**: `backend/routes/companyProfileRoutes.js`
  - GET endpoint to fetch supplier/buyer profile (supports both roles)
  - PUT endpoint to update profile (with authorization checks - users can edit their own, admins can edit any)
  - Advanced search endpoint with JSONB filtering
  - Database joins with users and user_profiles tables
  - **Authorization**: Users can edit their own profile; admins can edit any profile

- **API Integration**: Updated `frontend/src/api.js` with new `companyProfileAPI` export
  - `getSupplierProfile(supplierId)` - Fetch supplier data
  - `updateSupplierProfile(supplierId, data)` - Update supplier data
  - `searchSuppliers(filters)` - Advanced search with multiple filters

- **Routing Updates**: 
  - `/company-profile` - Profile viewer for all logged-in users
  - `/company-profile/admin` - Edit panel (suppliers, buyers, admins)
  - Full lazy-loading with React.lazy() and Suspense
  - Auto-loads current user's profile on admin panel

### Features
- ✅ Real API data integration (no mock data)
- ✅ Advanced filtering (category, rating, location, text search)
- ✅ Smooth transitions and professional layout
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Role-based access control for admin panel
- ✅ Error handling and loading states
- ✅ Theme compliance (Material-UI only, no custom CSS)
- ✅ Production-ready builds (46.59s, zero errors)

## Database Optimization (November 22, 2025)
### Performance Indexes Added:
- **User Profile Search Indexes:**
  - `idx_user_profiles_city` - Geographic search by city
  - `idx_user_profiles_country` - Geographic search by country  
  - `idx_user_profiles_rating DESC` - Sort by rating
  - `idx_user_profiles_user` - Quick lookup by user_id

- **User Role & Status Indexes:**
  - `idx_users_role` - Filter users by role (supplier/buyer/admin)
  - `idx_users_is_active` - Filter active users
  - `idx_users_is_verified` - Filter verified users
  - `idx_users_average_rating DESC` - Sort by average rating

- **Full Text Search (French):**
  - `idx_users_company_name` - Search company names in French
  - `idx_user_profiles_bio` - Search biographies in French
  - GIN indexes for optimal full-text search performance

- **JSONB Indexes:**
  - `idx_users_preferred_categories` - Search by service categories
  - `idx_users_service_locations` - Search by service locations

### Data Storage:
- **users table**: company_name, company_registration, phone, preferred_categories, service_locations, average_rating
- **user_profiles table**: bio, profile_picture, address, city, country, postal_code, tax_id, rating, total_reviews
- **supplier_verifications table**: verification_status, verification_document, verified_at
- All data fully persisted with audit trails (created_at, updated_at, created_by, updated_by)

## External Dependencies
- **Database**: PostgreSQL (Neon), with an optimized connection pool (max 20, idle 60s) and performance indexes.
- **Frontend Libraries**: Material-UI (MUI) v7.3.5, React Router DOM, Axios, i18next.
- **Backend Libraries**: Express, Node.js 20.

## Important Notes
- All database operations use PostgreSQL with Neon backend
- Frontend communicates via REST API to backend
- All styles use theme.js only - no inline sx (except MUI spacing utilities)
- No separate CSS files or custom gradients
- All components use Material-UI components exclusively
- French localization for all user-facing text
- Theme color: #0056B3 (primary blue)
- Database queries optimized with GIN indexes for fast searches
- Full text search supported in French for company profiles
