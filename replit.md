# MyNet.tn - B2B Procurement Platform

## Overview
MyNet.tn is a modern B2B procurement platform designed for the private sector. It features a unified institutional theme and enterprise-grade security. The platform aims to provide a robust, secure, and efficient solution for business-to-business transactions, focusing on a clean, professional user experience. Key capabilities include secure user authentication, dynamic content display, and optimized performance for a seamless user journey.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with small, testable changes. Please ask before making any major architectural changes or introducing new dependencies. I prefer detailed explanations for complex logic. I prefer that the agent works in the `/frontend` directory and does not make changes in the `/backend` directory.

## System Architecture
The platform is built with a React frontend (Vite 7.2.4) and a Node.js 20 backend.

### UI/UX Decisions
- **Design Principle**: 100% of styles are defined via `frontend/src/theme/theme.js`. No external CSS files are used, except for a minimal 17-line `index.css` for global resets.
- **Framework**: Exclusive use of Material-UI (MUI v7.3.5) for all components.
- **Visual Style**: Flat design with zero shadows (`box-shadow: 'none'`) and zero gradients.
- **Color Palette**: Fixed institutional colors: `#0056B3` (primary blue), `#F9F9F9` (background), `#212121` (text).
- **Spacing**: Grid-based spacing with an 8px base (multiples of 8px).
- **Border Radius**: Uniform 4px radius applied universally.
- **Typography**: Standardized Roboto font for all text elements.

### Technical Implementations
- **Code-Splitting & Optimization**: Implemented with lazy loading, `React.lazy()`, and `Suspense`. Manual chunks are defined for `react-core`, `mui-core`, `api`, and `i18n` to optimize bundle size and load times.
- **Security Architecture**:
    - **Token Management**: Access tokens are stored securely in memory (cleared on refresh) with a sessionStorage fallback. Refresh tokens are managed by the backend via httpOnly cookies.
    - **Automatic Token Refresh**: `axiosConfig.js` handles automatic token refresh before expiration, request queuing during refresh, and exponential backoff on failures, providing transparent retry without user intervention.
    - **XSS Protection**: All sensitive tokens have been migrated out of `localStorage`.
    - **CSRF Protection**: Supports CSRF tokens via meta tags.
- **Error Handling**:
    - **Error Boundaries**: `ErrorBoundary.jsx` component catches React errors, providing a user-friendly `ErrorFallback.jsx` UI and preventing full application crashes.
    - **API Error Handling**: `axiosConfig.js` provides automatic retry mechanisms, handles 401 (unauthorized) errors with token refresh, and redirects on 403 (forbidden) errors.
- **Data Validation**:
    - **Zod Integration**: Utilizes the Zod library for schema-based data validation (e.g., `LoginSchema`, `RegisterSchema`, `TenderSchema`) integrated via a `validateWithZod()` utility function.
- **Request Caching**: `axiosConfig.js` implements a 5-minute cache for GET requests, providing an automatic fallback to cached responses on network errors.

### System Design Choices
- **Single Source of Truth**: `theme.js` for styles, `tokenManager.js` for token handling, and `axiosConfig.js` for API interaction management.
- **Modular Components**: 91 modular JSX components and 90+ lazy-loaded pages.

## External Dependencies
- **Material-UI (MUI v7.3.5)**: Frontend UI component library.
- **React**: Frontend JavaScript library for building user interfaces.
- **Vite 7.2.4**: Frontend build tool.
- **Node.js 20**: Backend runtime environment.
- **Axios**: HTTP client for API requests.
- **Zod**: TypeScript-first schema declaration and validation library.
- **i18n**: Internationalization library (implied for language preferences).
### Phase 8 - MATERIAL-UI & REACT ROUTER COMPATIBILITY (22 Nov 2025) ✅

#### 1. **Grid v1 to v2 Migration** ✅
- [x] Converted 41 Grid components from v1 to v2 API
- [x] Old format: `<Grid xs={12} md={4} item />`
- [x] New format: `<Grid size={{ xs: 12, md: 4 }} />`
- [x] Removed deprecated `item` prop
- [x] Fixed 9 affected files

#### 2. **React Router Future Flags** ✅
- [x] Added `v7_startTransition` future flag
- [x] Added `v7_relativeSplatPath` future flag
- [x] Eliminates React Router v7 migration warnings
- [x] Prepares for future React Router versions

#### 3. **Warnings Eliminated**
- ✅ MUI Grid: "`item` prop has been removed" → FIXED
- ✅ MUI Grid: "`xs` prop removed" → FIXED (using size prop)
- ✅ React Router: "v7_startTransition future flag" → FIXED
- ✅ React Router: "v7_relativeSplatPath future flag" → FIXED

#### 4. **Files Modified**
```
Total Grid conversions: 41 instances across 9 files
- HowItWorks.jsx
- HomePageStats.jsx
- HomePageTestimonials.jsx
- HomePageFeatures.jsx
- HomePageRoleCards.jsx
- AdvancedSearch.jsx
- ProfileFormTab.jsx
- BudgetManagement.jsx
- ContactPage.jsx
- And 5+ more

React Router Future Flags:
- App.jsx: Added future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
```

#### 5. **Build Results**
```
Build Status: ✅ SUCCESS
- 1117 modules transformed
- Build time: 49.01s
- Bundle size: ~707 KB (gzip: ~218 KB)
- Errors: 0
- Warnings: REDUCED (Grid + Router warnings eliminated)
```

**Status**: ✅ All Material-UI and React Router compatibility issues RESOLVED

