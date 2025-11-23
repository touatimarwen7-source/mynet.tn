# Frontend-Backend Integration Documentation

## Overview
MyNet.tn platform features a complete, production-ready frontend-backend integration with:
- ✅ Real-time API communication
- ✅ Secure JWT authentication
- ✅ Token management and refresh
- ✅ Automatic error handling
- ✅ Request/response caching
- ✅ CSRF protection
- ✅ Complete audit logging

---

## Architecture

### System Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React/Vite)                     │
│                       Port: 5000                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Pages/Components                                         │  │
│  │  ├─ LoginComponent → authAPI                            │  │
│  │  ├─ AuditLogViewer → useSuperAdmin()                   │  │
│  │  ├─ FileManagement → useSuperAdmin()                   │  │
│  │  ├─ ArchiveManagement → useSuperAdmin()                │  │
│  │  └─ Other Components...                                │  │
│  └───────┬───────────────────────────────────────────────┬──┘  │
│          │                                               │      │
│  ┌───────┴───────────────────────────────────────────────┴──┐   │
│  │         Global Context Management                       │   │
│  │  ├─ AppContext (auth, app state, settings)            │   │
│  │  ├─ SuperAdminContext (admin operations)               │   │
│  │  └─ useApp, useAuth, useToast hooks                   │   │
│  └───────┬───────────────────────────────────────────────┬──┘   │
│          │                                               │      │
│  ┌───────┴───────────────────────────────────────────────┴──┐   │
│  │         Service Layer                                   │   │
│  │  ├─ superAdminService.js (Admin API calls)            │   │
│  │  ├─ api.js (All API endpoints)                        │   │
│  │  ├─ axiosConfig.js (Interceptors, token mgmt)         │   │
│  │  └─ tokenManager.js (Secure token storage)            │   │
│  └───────┬───────────────────────────────────────────────┬──┘   │
│          │                                               │      │
│          └──────────────────────┬──────────────────────┘       │
│                    HTTP/HTTPS with /api prefix                 │
└──────────────────────────────────┼────────────────────────────┘
                                   │
                                   │ 5000 → 3000 (via proxy)
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                        │
│                        Port: 3000                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express Routes (Protected)                             │  │
│  │  ├─ /api/auth/* (Authentication)                       │  │
│  │  ├─ /api/super-admin/* (30 Admin Endpoints)           │  │
│  │  ├─ /api/procurement/* (Procurement)                  │  │
│  │  ├─ /api/search/* (Search)                            │  │
│  │  └─ Other routes...                                    │  │
│  └───────┬───────────────────────────────────────────────┬──┘  │
│          │                                               │      │
│  ┌───────┴───────────────────────────────────────────────┴──┐   │
│  │  Authentication & Authorization Middleware              │   │
│  │  ├─ verifyToken (JWT validation)                       │   │
│  │  ├─ checkRole (Role-based access)                      │   │
│  │  ├─ ipMiddleware (IP tracking)                         │   │
│  │  └─ Other security middleware...                       │   │
│  └───────┬───────────────────────────────────────────────┬──┘  │
│          │                                               │      │
│  ┌───────┴───────────────────────────────────────────────┴──┐   │
│  │  Controllers & Business Logic                          │   │
│  │  ├─ superAdminController (30 methods)                 │   │
│  │  ├─ authController                                   │   │
│  │  ├─ procurementController                            │   │
│  │  └─ Other controllers...                              │   │
│  └───────┬───────────────────────────────────────────────┬──┘  │
│          │                                               │      │
│  ┌───────┴───────────────────────────────────────────────┴──┐   │
│  │  PostgreSQL Database                                    │   │
│  │  ├─ users table                                        │   │
│  │  ├─ audit_logs table                                  │   │
│  │  ├─ media_files table                                 │   │
│  │  ├─ backups table                                     │   │
│  │  └─ Other tables...                                    │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Service Layer

### 1.1 Main API Module (`frontend/src/api.js`)
Exports all API endpoint groups:
```javascript
export const authAPI = { /* 6 endpoints */ }
export const procurementAPI = { /* 15+ endpoints */ }
export const searchAPI = { /* 2 endpoints */ }
export const adminAPI = { /* 4 endpoints */ }
export const directSupplyAPI = { /* 5 endpoints */ }
// ... more exports
```

**All calls go through:** `axiosInstance` (configured axios)

### 1.2 Axios Configuration (`frontend/src/services/axiosConfig.js`)

**Features:**
- ✅ Base URL: `/api` (relative, proxied to backend)
- ✅ Automatic token injection in headers
- ✅ CSRF token handling
- ✅ Automatic token refresh (2 min before expiry)
- ✅ Request/response caching (5-minute stale-while-revalidate)
- ✅ 401/403 error handling with auto-logout
- ✅ 30-second request timeout
- ✅ httpOnly cookie support

**Request Flow:**
```
1. Component calls API → authAPI.login()
2. axiosInstance.post('/auth/login', data)
3. Request Interceptor runs:
   - Checks if token is valid
   - Adds Authorization header: Bearer {token}
   - Adds CSRF token from meta tag
   - Adds security headers (X-Requested-With, etc.)
4. Sends to /api/auth/login
5. Backend handles request
6. Response returns
7. Response Interceptor runs:
   - Caches GET requests
   - Handles 401: Refreshes token and retries
   - Handles 403: Logs error
   - Returns response to component
```

### 1.3 Token Manager (`frontend/src/services/tokenManager.js`)

**Secure Token Storage:**
```javascript
// Local Storage + In-Memory
TokenManager.setAccessToken(token, expiresIn)
TokenManager.getAccessToken()
TokenManager.setRefreshTokenId(token)
TokenManager.getRefreshTokenId()

// Token Validation
TokenManager.isTokenValid() // Checks expiration
TokenManager.shouldRefreshToken() // 2 min before expiry
TokenManager.clearTokens() // On logout
```

**Token Persistence:**
- Access Token: In-memory cache + localStorage
- Refresh Token: httpOnly cookie (secure)
- User Data: localStorage (encrypted)

---

## 2. Context Layer

### 2.1 AppContext (`frontend/src/contexts/AppContext.jsx`)

**Global App State:**
```javascript
{
  // Authentication
  user: { id, email, name, role, ... },
  isAuthenticated: boolean,
  authLoading: boolean,
  authError: null,
  
  // App State
  appLoading: boolean,
  appError: null,
  toasts: [],
  
  // Settings
  sidebarOpen: boolean,
  appSettings: { language, theme, notifications }
}
```

**Available Hooks:**
```javascript
const { user, logout, login, updateUser } = useAuth()
const { addToast, removeToast } = useToast()
const { appLoading, appError } = useApp()
```

### 2.2 SuperAdminContext (`frontend/src/contexts/SuperAdminContext.jsx`)

**Admin-Specific State:**
```javascript
{
  pages: [],
  files: [],
  documents: [],
  users: [],
  auditLogs: [],
  backups: [],
  loading: boolean,
  error: null,
  success: null
}
```

**Available Methods:**
```javascript
const {
  // Pages
  fetchPages, createPage, updatePage, deletePage,
  
  // Files
  fetchFiles, uploadFile, deleteFile,
  
  // Users
  fetchUsers, blockUser, unblockUser,
  
  // Audit Logs
  fetchAuditLogs,
  
  // Backups
  fetchBackups, createBackup, restoreBackup,
  
  // Loading states
  loading, error, success
} = useSuperAdmin()
```

---

## 3. Real API Integration Examples

### 3.1 Authentication Flow

**Component:**
```javascript
// pages/Login.jsx
const { addToast } = useToast();

const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    TokenManager.setAccessToken(response.data.accessToken);
    addToast('Login successful', 'success');
    navigate('/dashboard');
  } catch (error) {
    addToast(error.message, 'error');
  }
};
```

**Network Request:**
```
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{ "email": "admin@mynet.tn", "password": "..." }

---

Response:
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "admin@mynet.tn", ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Backend Processing:**
```
1. Express Route: POST /api/auth/login
2. authController.login()
3. Query database: SELECT * FROM users WHERE email = ?
4. Validate password hash
5. Generate JWT token
6. Return token + user data
7. Log to audit_logs table
```

### 3.2 File Upload Integration

**Component:**
```javascript
// pages/FileManagement.jsx
const { uploadFile } = useSuperAdmin();

const handleFileUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    await uploadFile(formData);
    addToast('File uploaded', 'success');
  } catch (error) {
    addToast(error.message, 'error');
  }
};
```

**Network Request:**
```
POST /api/super-admin/files HTTP/1.1
Host: localhost:5000
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]

---

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "document_abc123.pdf",
    "file_path": "/uploads/...",
    "file_size": 2048000
  }
}
```

**Backend Processing:**
```
1. Express Route: POST /api/super-admin/files
2. Middleware: verifyToken, checkRole(['super_admin'])
3. Multer: Process multipart/form-data
4. Validate file size (50MB max)
5. Save file to storage
6. Create media_files DB record
7. Log audit: "UPLOAD_FILE"
8. Return file metadata
```

### 3.3 Audit Log Retrieval

**Component:**
```javascript
// pages/AuditLogViewer.jsx
const { auditLogs, loading, error, fetchAuditLogs } = useSuperAdmin();

useEffect(() => {
  fetchAuditLogs({ page: 1, limit: 10, action: 'CREATE_PAGE' });
}, []);
```

**Network Request:**
```
GET /api/super-admin/audit-logs?page=1&limit=10&action=CREATE_PAGE HTTP/1.1
Host: localhost:5000
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}

---

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "action": "CREATE_PAGE",
      "description": "Created page: Services",
      "status": "success",
      "ip_address": "192.168.1.100",
      "created_at": "2025-01-20T14:30:45Z"
    }
  ],
  "pagination": { "total": 150, "page": 1, "limit": 10 }
}
```

**Backend Processing:**
```
1. Express Route: GET /api/super-admin/audit-logs
2. Middleware: verifyToken, checkRole(['super_admin'])
3. Query parameters: page, limit, action filter
4. Build SQL query with filters
5. Query database: SELECT FROM audit_logs WHERE ...
6. Count total records
7. Apply pagination (LIMIT, OFFSET)
8. Return data + pagination info
```

---

## 4. Request/Response Flow

### Complete Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Component makes API call                               │
│                                                                  │
│  const response = await authAPI.login(data);                  │
│                                                                  │
│  → Calls: axiosInstance.post('/auth/login', data)            │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Request Interceptor                                    │
│                                                                  │
│  ✓ Verify token is valid                                       │
│  ✓ Add Authorization header: Bearer {token}                    │
│  ✓ Add CSRF token from meta tag                                │
│  ✓ Add security headers (X-Requested-With, etc.)               │
│  ✓ Check if token needs refresh (2 min before expiry)         │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: HTTP Request                                           │
│                                                                  │
│  POST /api/auth/login HTTP/1.1                                 │
│  Authorization: Bearer eyJhbGc...                              │
│  X-CSRF-Token: 12345...                                        │
│  X-Requested-With: XMLHttpRequest                              │
│                                                                  │
│  { "email": "admin@mynet.tn", "password": "..." }            │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Backend Express Router                                 │
│                                                                  │
│  Route: POST /api/auth/login                                   │
│  URL: http://localhost:3000/api/auth/login                    │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Backend Middleware                                     │
│                                                                  │
│  ✓ ipMiddleware: Extract client IP                            │
│  ✓ Parse JSON body                                            │
│  ✓ Note: Login route doesn't need verifyToken (public)       │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Backend Controller                                     │
│                                                                  │
│  authController.login()                                        │
│  ├─ Validate input                                            │
│  ├─ Query: SELECT * FROM users WHERE email = ?              │
│  ├─ Verify password hash                                     │
│  ├─ Generate JWT token                                       │
│  ├─ Log audit: "LOGIN" action                               │
│  └─ Return token + user data                                │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: HTTP Response                                          │
│                                                                  │
│  HTTP/1.1 200 OK                                               │
│  Content-Type: application/json                                │
│                                                                  │
│  {                                                             │
│    "success": true,                                            │
│    "data": {                                                   │
│      "user": { ... },                                          │
│      "accessToken": "eyJhbGc...",                             │
│      "expiresIn": 900                                         │
│    }                                                           │
│  }                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: Response Interceptor                                   │
│                                                                  │
│  ✓ Cache response (GET requests only)                         │
│  ✓ Check status code                                          │
│  ✓ If 401: Refresh token and retry                           │
│  ✓ If 403: Log error                                         │
│  ✓ Return response to component                              │
└────────────────────┬────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 9: Component Receives Data                                │
│                                                                  │
│  const response = { data: { user, accessToken, ... } }        │
│                                                                  │
│  // Component uses data                                        │
│  TokenManager.setAccessToken(response.data.accessToken)       │
│  navigate('/dashboard')                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await authAPI.login({ email, password });
  // Success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - show login error
    addToast('Invalid credentials', 'error');
  } else if (error.response?.status === 403) {
    // Forbidden - user blocked
    addToast('Account blocked', 'error');
  } else if (error.response?.status === 500) {
    // Server error
    addToast('Server error', 'error');
  } else if (!error.response) {
    // Network error
    addToast('Network connection failed', 'error');
  }
}
```

### Backend Error Responses

All endpoints return consistent error structure:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

With HTTP status codes:
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Server Error (internal error)

---

## 6. Security Features

### Authentication & Authorization

```
Frontend                          Backend
┌──────────────────┐             ┌──────────────────┐
│ User credentials │─────────────→ │ Validate & Hash  │
│                  │              │ Generate JWT     │
│ Store JWT token  │←─────────────│ Return token     │
└──────────────────┘             └──────────────────┘

For protected endpoints:
┌──────────────────┐             ┌──────────────────┐
│ Add token to     │             │ Verify JWT       │
│ Authorization    │─────────────→ │ Check expiry     │
│ header           │              │ Extract user ID  │
│                  │              │ Verify signature │
│ Receive response │←─────────────│ Execute endpoint │
└──────────────────┘             └──────────────────┘
```

### Token Management

```javascript
// Automatic token refresh
- Check token expiry before each request
- If <2 min before expiry: Silently refresh
- Uses httpOnly refresh token cookie
- Automatic retry on 401

// Token storage
- Access Token: In-memory + localStorage
- Refresh Token: httpOnly cookie (secure)
- User Data: localStorage (encrypted)
```

### CSRF Protection

```javascript
// Frontend
- Generate CSRF token in meta tag (during init)
- Send token in X-CSRF-Token header on mutations
- Validate on server

// Backend
- Generate random CSRF token
- Verify token on POST/PUT/DELETE requests
- Prevent cross-site request forgery
```

### IP Address Tracking

```javascript
// Backend middleware captures client IP
req.clientIP = extract from headers:
  1. X-Forwarded-For (proxies/load balancers)
  2. X-Real-IP (nginx, etc.)
  3. Socket remote address (direct connections)
  4. Default: 0.0.0.0

// Logged to audit_logs table with every admin action
INSERT INTO audit_logs (user_id, action, ip_address, ...)
```

---

## 7. Integration Testing

### Test Frontend-Backend Communication

**Using cURL:**

```bash
# Step 1: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mynet.tn", "password": "password123"}'

# Response: {"accessToken": "eyJhbGc...", "data": {...}}

# Step 2: Use token for protected endpoint
TOKEN="eyJhbGc..."
curl -X GET http://localhost:3000/api/super-admin/pages \
  -H "Authorization: Bearer $TOKEN"

# Response: {"success": true, "data": [...]}
```

**Using Browser DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action in UI
4. Observe HTTP requests:
   - POST /api/auth/login
   - GET /api/super-admin/pages
   - POST /api/super-admin/files
   - etc.

**Using Postman Collection:**

1. Import `MyNet.tn_Admin_API.postman_collection.json`
2. Set Bearer token in Authorization tab
3. Test all endpoints
4. Observe request/response details

---

## 8. Performance Optimization

### Response Caching

```javascript
// GET requests cached for 5 minutes
// Stale-while-revalidate strategy
// On network error: Serve cached response

Example: LIST endpoints
GET /api/super-admin/pages
→ First request: Cache miss, query database
→ Subsequent requests (within 5 min): Serve cached
→ 6th minute: Cache expires, next request queries DB
```

### Token Refresh Strategy

```javascript
// Proactive refresh (2 minutes before expiry)
// Avoids 401 errors during user session
// Uses httpOnly refresh token cookie
// Automatic retry on failed requests
```

### Request Timeout

```javascript
// 30-second timeout on all requests
// Prevents hanging requests
// Returns timeout error to component
```

---

## 9. Real Data Flow Examples

### Example 1: Create Page

```
Frontend Component
  ↓
  const response = await superAdminService.pagesAPI.create({
    title: "Services",
    slug: "services",
    content: "...",
    meta_description: "..."
  })
  ↓
  axios POST → /api/super-admin/pages
  ↓
Backend Route: POST /api/super-admin/pages
  ↓
authMiddleware.verifyToken() - Validate JWT
  ↓
authMiddleware.checkRole(['super_admin']) - Check role
  ↓
ipMiddleware - Extract client IP
  ↓
superAdminController.createPage()
  - INSERT INTO static_pages (title, slug, content, meta_description)
  - logAuditAction(user_id, 'CREATE_PAGE', ..., req.clientIP)
  - INSERT INTO audit_logs (...)
  ↓
Response: { success: true, data: {...} }
  ↓
Frontend receives response
  - Update SuperAdminContext state
  - Show success toast
  - Update UI with new page
```

### Example 2: Get Audit Logs

```
Frontend Component
  ↓
  const { auditLogs, fetchAuditLogs } = useSuperAdmin()
  
  useEffect(() => {
    fetchAuditLogs({ page: 1, limit: 10, action: 'CREATE_PAGE' })
  })
  ↓
  axios GET → /api/super-admin/audit-logs?page=1&limit=10&action=CREATE_PAGE
  ↓
Response Interceptor
  - Cache response (GET request)
  ↓
Backend Route: GET /api/super-admin/audit-logs
  ↓
authMiddleware.verifyToken()
  ↓
authMiddleware.checkRole(['super_admin'])
  ↓
superAdminController.getAuditLogs()
  - SELECT FROM audit_logs WHERE action = 'CREATE_PAGE'
  - Apply pagination (LIMIT 10 OFFSET 0)
  - Count total records
  ↓
Response: { success: true, data: [...], pagination: {...} }
  ↓
Frontend receives response
  - Update SuperAdminContext.auditLogs state
  - Re-render AuditLogViewer component
  - Display logs with pagination
```

---

## 10. Health Check

### Backend Health Endpoint

```bash
curl -X GET http://localhost:3000/api/super-admin/health \
  -H "Authorization: Bearer {token}"

Response:
{
  "success": true,
  "data": {
    "database": {
      "status": "healthy",
      "response_time": "5ms",
      "connections": 8
    },
    "server": {
      "cpu": 35,
      "memory": 42,
      "disk": 58,
      "status": "healthy"
    },
    "timestamp": "2025-01-20T14:30:00Z",
    "uptime": 3600000
  }
}
```

---

## Summary

✅ **Frontend-Backend Integration Status: COMPLETE**

| Component | Status | Details |
|-----------|--------|---------|
| **Axios Configuration** | ✅ | Token management, interceptors, caching |
| **API Service Layer** | ✅ | All endpoints properly exported |
| **Super Admin Service** | ✅ | 10 admin functions, 30 endpoints |
| **Global Context** | ✅ | AppContext + SuperAdminContext |
| **Authentication** | ✅ | JWT + token refresh + httpOnly cookies |
| **Authorization** | ✅ | Role-based access control |
| **Error Handling** | ✅ | Comprehensive error responses |
| **Audit Logging** | ✅ | All actions logged with IP tracking |
| **Security** | ✅ | CSRF protection, XSS prevention |
| **Caching** | ✅ | Response caching, stale-while-revalidate |
| **Real Data** | ✅ | All data stored in PostgreSQL database |
| **API Documentation** | ✅ | ADMIN_API.md + Postman collection |

**The frontend and backend are fully integrated with real API communication, secure authentication, and complete data persistence.**
