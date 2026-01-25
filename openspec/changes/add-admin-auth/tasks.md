# Tasks: Add Admin Authentication

## 1. Core Auth Infrastructure

- [ ] 1.1 Create `src/lib/auth/admin.ts` with password verification and session token utilities
- [ ] 1.2 Add tests for admin auth utilities
- [ ] 1.3 Add `ADMIN_PASSWORD_HASH` to `.env.example` with setup instructions

## 2. Auth API Endpoints

- [ ] 2.1 Create `POST /api/auth/login` - Verify password, set session cookie
- [ ] 2.2 Create `POST /api/auth/logout` - Clear session cookie
- [ ] 2.3 Create `GET /api/auth/session` - Check current session status

## 3. Login UI

- [ ] 3.1 Create login page at `src/app/login/page.tsx` with password form
- [ ] 3.2 Add redirect to dashboard on successful login
- [ ] 3.3 Show error message for invalid credentials

## 4. Route Protection

- [ ] 4.1 Create `src/middleware.ts` to protect admin routes
- [ ] 4.2 Redirect unauthenticated users to `/login`
- [ ] 4.3 Redirect authenticated users from `/login` to `/dashboard`

## 5. API Protection

- [ ] 5.1 Create `requireAdminAuth()` utility for API routes
- [ ] 5.2 Add auth check to client API routes (`/api/clients/*`)
- [ ] 5.3 Add auth check to timesheet API routes (`/api/timesheets/*`)
- [ ] 5.4 Add auth check to settings API routes (`/api/settings/*`)
- [ ] 5.5 Add auth check to metrics API routes (`/api/metrics/*`)
- [ ] 5.6 Add auth check to Toggl API routes (`/api/toggl/*`)

## 6. Admin UI Updates

- [ ] 6.1 Add logout button to admin layout navigation
