# Design: Admin Dashboard Authentication

## Context

This is a personal tool for a single admin user. The client portal already uses JWT tokens for per-client access. The admin portal needs a simple, secure authentication mechanism that doesn't require user management infrastructure.

**Constraints**:
- Single admin user (no user registration or management needed)
- MVP-first: simple password auth now, Azure Entra ID later if productized
- Must work with Next.js App Router (server components, route handlers)
- Secure session handling (HTTP-only cookies, no localStorage tokens)

## Goals / Non-Goals

**Goals**:
- Protect all admin routes and API endpoints from unauthorized access
- Simple password-based login with secure session
- Easy to upgrade to SSO later

**Non-Goals**:
- Multi-user support or user management
- Password reset flow (admin can update env var)
- Remember me / persistent sessions across browser restarts
- Rate limiting (can add later if needed)

## Decisions

### 1. Session-Based Auth with HTTP-Only Cookies

**Decision**: Use signed session tokens stored in HTTP-only, secure cookies.

**Why**:
- HTTP-only cookies prevent XSS token theft
- Secure flag ensures HTTPS-only transmission
- SameSite=Lax prevents CSRF for GET requests
- Server-side session validation on each request

**Alternatives considered**:
- JWT in localStorage: Vulnerable to XSS, harder to invalidate
- Next.js Auth.js: Overkill for single-user password auth

### 2. Password Hashing with bcrypt

**Decision**: Store bcrypt hash in `ADMIN_PASSWORD_HASH` env var.

**Why**:
- bcrypt is industry standard for password hashing
- Cost factor makes brute force impractical
- No database table needed for single user

**Setup**: Admin runs `npx bcrypt-cli hash "password"` to generate hash.

### 3. Session Token Structure

**Decision**: Sign a simple session payload with `jose` (already used for JWTs).

```typescript
interface AdminSession {
  type: 'admin'
  iat: number
  exp: number
}
```

**Why**:
- Reuses existing JWT infrastructure
- Stateless verification (no session store needed)
- 24-hour expiry balances security and convenience

### 4. Middleware vs Per-Route Checks

**Decision**: Use Next.js middleware for route protection + utility for API routes.

**Why**:
- Middleware handles UI routes efficiently (redirects before rendering)
- API routes use shared `requireAdminAuth()` utility for consistency
- Clear separation of concerns

**File structure**:
```
src/
├── middleware.ts              # Protects /dashboard, /timesheets, etc.
├── lib/auth/
│   ├── jwt.ts                 # Existing portal token utils
│   ├── admin.ts               # NEW: Admin auth utilities
│   └── admin.test.ts          # NEW: Tests
├── app/
│   ├── login/page.tsx         # NEW: Login form
│   └── api/auth/
│       ├── login/route.ts     # NEW: POST login
│       ├── logout/route.ts    # NEW: POST logout
│       └── session/route.ts   # NEW: GET session status
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Password in env var visible to deployment system | Use secrets manager in production (Azure Key Vault) |
| No password reset | Document password update procedure (regenerate hash, update env) |
| Session hijacking if cookie stolen | Short expiry (24h), secure cookie flags, HTTPS only |

## Migration Plan

1. Implement auth without breaking existing routes (gated behind feature flag if needed)
2. Add login page and auth endpoints
3. Enable middleware protection
4. Update API routes to require auth
5. No rollback needed (removing protection is trivial)

## Open Questions

None - design is straightforward for MVP scope.
