# MyNet.tn - Procurement & Tender Management System

## Overview

MyNet.tn is a comprehensive procurement and tender management system built for the Tunisian market. The platform facilitates the entire procurement lifecycle - from tender creation and publication, through supplier bidding, to purchase order generation. The system supports multiple user roles (Admin, Buyer, Supplier, Accountant, Viewer) with granular permission controls to ensure secure and compliant procurement processes.

The backend is built as a REST API using Node.js and Express, with PostgreSQL as the primary database and Redis for caching and session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Framework**: Node.js with Express.js for RESTful API endpoints

**Language**: JavaScript (with plans noted for TypeScript migration based on attached assets)

**Application Structure**: Layered architecture with clear separation of concerns:
- **Models Layer**: Domain entities (User, Tender, Offer, PurchaseOrder) extending a common BaseEntity for audit fields
- **Services Layer**: Business logic encapsulation (TenderService, OfferService, UserService, SearchService, NotificationService)
- **Controllers Layer**: Request handling organized by domain (auth, procurement, admin)
- **Routes Layer**: API endpoint definitions with middleware chains
- **Security Layer**: Authentication and authorization guards with permission-based access control

**Design Patterns**:
- Service layer pattern for business logic isolation
- Repository pattern implied through service database access
- Role-based access control (RBAC) with granular permissions
- Soft deletes on all entities (is_deleted flag)
- Audit trail tracking (created_by, updated_by, created_at, updated_at)

### Authentication & Authorization

**Token Management**: JWT-based authentication with separate access and refresh tokens
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- KeyManagementService handles token generation and verification

**Password Security**: PBKDF2 with random salt
- 1000 iterations
- SHA-512 hashing algorithm
- Salt and hash stored separately

**Authorization Model**: Permission-based system with predefined roles
- Roles: ADMIN, BUYER, SUPPLIER, ACCOUNTANT, VIEWER
- Permissions mapped to roles in RolePermissions configuration
- AuthorizationGuard middleware enforces authentication and permission requirements
- Routes protected with `authenticateToken`, `requireRole`, and `requirePermission` guards

### Data Storage

**Primary Database**: PostgreSQL (hosted on Neon)
- Connection pooling via pg library
- SSL required for connections
- Schema initialization on server startup

**Database Schema**:
- **users**: User accounts with role-based access, company information, verification status
- **tenders**: Tender/RFP records with budgets, deadlines, requirements (JSONB), evaluation criteria (JSONB)
- **offers**: Supplier bids linked to tenders with technical/financial proposals, attachments (JSONB)
- **purchase_orders**: Generated from accepted offers with line items (JSONB)
- **notifications**: System notifications for users
- All tables include soft delete flags and audit timestamps

**Caching Layer**: Redis integration for performance optimization
- Session management
- Search result caching (planned)
- Notification queuing (planned)

### API Structure

**Endpoint Organization**:
- `/api/auth/*` - Authentication and profile management
- `/api/procurement/*` - Tender and offer management
- `/api/admin/*` - Administrative functions (user management, statistics)
- `/api/search/*` - Advanced search for tenders and suppliers

**Response Format**: Consistent JSON structure with success/error indicators
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

**Error Handling**: Centralized error middleware with specific handling for:
- Validation errors (400)
- Authentication failures (401)
- Authorization failures (403)
- Resource conflicts (409)
- Database constraint violations
- Generic server errors (500)

### Business Logic Features

**Tender Lifecycle**:
1. Draft creation by buyers
2. Publication with deadline setting
3. Supplier offer submission
4. Offer evaluation with scoring
5. Winner selection
6. Purchase order generation
7. Archiving/closing

**Unique Identifier Generation**: Collision-safe identifier system using cryptographic randomness
- Tenders: `TND-YYYYMMDD-RANDOMHEX` (e.g., TND-20251119-5A3F8E2D)
- Offers: `OFF-YYYYMMDD-RANDOMHEX` (e.g., OFF-20251119-B8C2D14F)
- Format: Date (YYYYMMDD) + 8-character hex string from 4 random bytes
- Ensures uniqueness even under concurrent requests (addressed Nov 2025)

**Search Capabilities**:
- Keyword search across title and description
- Filtering by category, status, budget range
- Pagination support (limit/offset)
- Public tender visibility controls

**Validation Layer**: Input validation utilities for:
- Email format validation
- Password strength requirements (minimum 6 characters)
- Phone number format
- Tender data completeness and logic (budget ranges, deadline validity)
- Offer data requirements

## External Dependencies

### Third-Party Packages

**Core Dependencies**:
- `express` (^4.18.2) - Web application framework
- `pg` (^8.11.3) - PostgreSQL client for Node.js
- `jsonwebtoken` (^9.0.2) - JWT token creation and verification
- `dotenv` (^16.0.3) - Environment variable management
- `redis` (^4.6.14) - Redis client with support for Bloom filters, graphs, and other modules

**Development Dependencies**:
- `nodemon` (^2.0.22) - Development server with hot reloading

### External Services

**Database**: Neon PostgreSQL
- Serverless PostgreSQL hosting
- SSL-required connections
- Connection string via `DATABASE_URL` environment variable

**Caching**: Redis (connection details in environment)
- Used for session management
- Planned usage for search caching and async messaging

### Environment Configuration

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for access token signing (auto-generated if missing)
- `JWT_REFRESH_SECRET` - Secret key for refresh token signing (auto-generated if missing)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)

### Future Integration Points

Based on repository structure and attached assets, planned integrations include:
- File storage service for tender/offer attachments
- Email notification service
- Payment gateway for subscription management (webhooks structure present)
- Advanced search with full-text indexing