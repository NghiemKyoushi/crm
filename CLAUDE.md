# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 CRM application for Stream Cargo, built with TypeScript, React 18, Ant Design, and TanStack Query. The application manages customer relationships, orders, finances, and user permissions with comprehensive i18n support (Vietnamese and English).

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm lint
```

## Architecture Overview

### Application Structure

The application follows a **feature-based architecture** with Next.js App Router:

- **`app/`** - Next.js App Router pages
  - `(public)/` - Public routes (login, register, forgot password)
  - `(protected)/` - Protected routes wrapped with authentication
  - Each route group has its own `layout.tsx`

- **`features/`** - Feature modules organized by domain
  - Each feature contains: `components/`, `hooks/`, `types/`, `views/`, `apis/`
  - Features include: dashboard, orderhub, user-management, finance-management, partner-manage, settings, etc.

- **`components/`** - Shared components
  - `common/` - Reusable components (with-authen, error-boundary)
  - `guards/` - PermissionGuard, RouteGuard
  - `layout/` - Layout components (Layout, Sidebar, Header)

- **`api/`** - API client configuration
  - `axiosClient.ts` - Axios instance with interceptors, auth refresh, i18n headers

- **`services/`** - Business logic services
  - `auth.ts` - Authentication service
  - `user.ts` - User service

- **`utils/`** - Utility functions
  - `permissions.ts` - Permission checking and route protection
  - `cache-manager.ts` - Cache management utilities

- **`types/`** - TypeScript type definitions organized by domain

- **`constants/`** - Application constants
  - `api-type.ts` - API endpoint definitions
  - `storage.ts` - Storage keys

- **`stores/`** - Zustand stores (currently commented out, using cookies)

- **`locales/`** - i18n translations
  - `vi/` - Vietnamese translations
  - `en/` - English translations
  - `i18n.ts` - i18next configuration

### Key Architecture Patterns

#### Authentication & Authorization

1. **Middleware-based route protection** (`middleware.ts`):
   - Checks for token in cookies
   - Redirects unauthenticated users to `/login`
   - Stores original path in `redirect` query param for post-login navigation
   - Public routes: `/login`, `/register`, `/forgot-password`

2. **Component-level authentication** (`components/common/with-authen.tsx`):
   - HOC wrapper for protected components
   - Validates token presence in cookies
   - Redirects to login if token missing

3. **Permission-based access control** (`utils/permissions.ts`):
   - Granular permissions system (e.g., `order.view`, `order.create`, `user.edit`)
   - Route-level permission mapping in `ROUTE_PERMISSIONS`
   - `checkPermissions()` utility supports AND/OR logic for multiple permissions
   - Guards: `PermissionGuard` and `RouteGuard` components

#### API Client (`api/axiosClient.ts`)

- **Automatic token refresh**: Intercepts 401 responses, refreshes access token using refresh token
- **Queue management**: Queues failed requests during token refresh, retries after refresh
- **Device info headers**: Automatically adds platform, device ID, OS version, location to all requests
- **i18n support**:
  - Sends `Accept-Language` header based on current language
  - Translates `message_key` from API responses using i18next
  - Provides `getResponseMessage()` and `getResponseMessageKey()` utilities
- **Cookie-based auth**: Uses `js-cookie` for token storage (not localStorage)

#### State Management

- **TanStack Query** for server state (API responses, caching)
  - Configured in `app/app-provider.tsx`
  - Default stale time: 5 minutes
  - Cache time: 10 minutes
  - Refetch on mount, not on window focus
- **Cookies** for authentication tokens (access token, refresh token)
- **Zustand** for client state (currently commented out in favor of cookies)

#### Internationalization (i18n)

- **next-i18next** integration with i18next
- Default locale: Vietnamese (`vi`)
- Supported locales: `vi`, `en`
- Locale detection disabled (manually switched by user)
- Translation files in `locales/vi/` and `locales/en/`
- API responses support `message_key` for automatic translation

#### Error Handling

- **Early cache manager** (inline script in `app/layout.tsx`):
  - Detects critical errors (ChunkLoadError, null reads, etc.)
  - Clears all caches, cookies, localStorage on critical errors
  - Shows user-friendly message before reload
- **ErrorBoundaryWrapper** component catches React errors
- **Global error handlers** for unhandled promises and errors

## Important Conventions

### File Organization

- Feature code lives in `features/[feature-name]/`
- Each feature should have: `components/`, `views/`, `hooks/`, `types/`
- API calls defined in `constants/api-type.ts` as constants
- Types defined in `types/` directory, named by domain (e.g., `orderhub.ts`, `customer-type.ts`)

### Routing

- Use Next.js App Router conventions
- Protected routes must be in `app/(protected)/`
- Public routes must be in `app/(public)/`
- Route permissions defined in `utils/permissions.ts` ROUTE_PERMISSIONS

### API Calls

- Use the shared `api` instance from `api/axiosClient.ts`
- Define API endpoints in `constants/api-type.ts`
- API responses follow format: `{ success, timestamp, code, message, message_key, data, errors }`
- Use `getResponseMessage(response)` to get localized messages

### Styling

- **Tailwind CSS 4** for utility classes
- **Ant Design 5.21.4** for components
- Custom global styles in `app/globals.css`
- Font: Noto Sans JP (configured in `app/layout.tsx`)

### TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to project root
- Target: ES2017
- Use explicit types for all API responses and props

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_ROOT_STATIC_URL` - Backend API base URL

## Important Files

- `middleware.ts` - Authentication and route protection
- `api/axiosClient.ts` - API client with auth refresh and i18n
- `utils/permissions.ts` - Permission system and route guards
- `utils/cache-manager.ts` - Cache clearing and management
- `app/layout.tsx` - Root layout with early error handling
- `app/app-provider.tsx` - React Query provider
- `next-i18next.config.js` - i18n configuration
- `constants/api-type.ts` - API endpoint definitions

## React Query Usage

When using TanStack Query:
- Use `useQuery` for GET requests (fetching data)
- Use `useMutation` for POST/PUT/DELETE requests (modifying data)
- Leverage automatic caching and refetching
- Invalidate queries after mutations to trigger refetch

## Permission System

To add permission checks:
1. Define permission in backend and add to `utils/permissions.ts` ROUTE_PERMISSIONS
2. Use `PermissionGuard` component to wrap protected content
3. Use `checkPermissions()` utility for programmatic checks
4. Set `requireAll: true` if user needs ALL permissions, otherwise ANY permission is sufficient
