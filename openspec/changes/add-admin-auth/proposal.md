# Change: Add Admin Dashboard Authentication

## Why

The admin portal currently has no authentication. Anyone with the URL can access the dashboard, manage clients, view timesheets, and modify settings. This also means admin-only API endpoints (e.g., `/api/timesheets/[id]/pdf`) are publicly accessible, creating a security gap.

## What Changes

- Add password-based authentication for the admin portal
- Protect all admin routes (`/dashboard`, `/timesheets`, `/clients`, `/settings`, etc.)
- Protect all admin API endpoints (clients, timesheets, settings, metrics)
- Add login page at `/login`
- Add session management with secure HTTP-only cookies
- Add logout functionality

## Impact

- **Affected specs**: New `admin-auth` capability
- **Affected code**:
  - `src/app/(admin)/layout.tsx` - Add auth check wrapper
  - `src/app/login/` - New login page
  - `src/app/api/auth/` - New auth endpoints (login, logout, session)
  - `src/lib/auth/` - New admin auth utilities
  - All admin API routes - Add auth middleware
- **Environment**: New `ADMIN_PASSWORD_HASH` environment variable
