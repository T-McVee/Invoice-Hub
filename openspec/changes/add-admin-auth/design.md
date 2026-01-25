# Design: Admin Dashboard Authentication

## Context

This is a personal tool for a single admin user deployed to Azure App Service. Rather than implementing custom authentication code, we use Azure App Service's built-in authentication feature (Easy Auth) which handles auth at the platform level before requests reach the application.

**Constraints**:
- Single admin user (personal Microsoft account or Entra ID)
- Deployed to Azure App Service
- MVP-first: use platform features over custom code

## Goals / Non-Goals

**Goals**:
- Protect all admin routes and API endpoints from unauthorized access
- Zero auth code to maintain
- Easy upgrade path if productized (just update Entra ID config)

**Non-Goals**:
- Custom login UI (Easy Auth provides Microsoft's standard login)
- Fine-grained role-based access (single admin user)
- Support for non-Azure hosting

## Decisions

### 1. Use Azure Easy Auth with Microsoft Entra ID

**Decision**: Enable App Service Authentication with Microsoft as the identity provider.

**Why**:
- Zero application code changes
- Auth happens at infrastructure level before requests reach the app
- Microsoft handles token validation, session management, security updates
- Already deploying to Azure App Service
- Natural upgrade to multi-user Entra ID if productized

**Trade-off**: Locks us to Azure App Service. If we move hosts, we'd need to implement auth in code. Acceptable for a personal tool.

### 2. Restrict Access to Specific User(s)

**Decision**: Configure "Require authentication" and limit to specific Microsoft account(s).

**Options**:
- Use personal Microsoft account (simplest for single user)
- Create Entra ID app registration with user assignment (more formal)

For MVP, personal Microsoft account is sufficient.

### 3. Client Portal Remains Public

**Decision**: Easy Auth protects the entire app, but `/api/portal/*` routes use their own JWT-based client token auth which continues to work.

**How it works**: Easy Auth can be configured to allow unauthenticated requests to specific paths, or the client portal can be hosted separately. For simplicity, we configure Easy Auth to require auth but the portal's token-based access is handled at the app level.

**Note**: Need to verify Easy Auth behavior with the existing portal token flow. May need to exclude `/portal/*` and `/api/portal/*` paths from Easy Auth.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Vendor lock-in to Azure | Acceptable for personal tool; can add code-based auth if migrating |
| Easy Auth may interfere with client portal | Configure path exclusions for `/portal/*` and `/api/portal/*` |
| No custom login UI | Microsoft's login UI is professional and familiar |

## Migration Plan

1. Create Entra ID app registration (or use personal account)
2. Enable App Service Authentication in Azure Portal
3. Configure Microsoft identity provider
4. Test admin access and client portal access
5. No code deployment needed

## Open Questions

- Confirm path exclusion configuration for client portal routes
