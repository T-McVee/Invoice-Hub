# Tasks: Add Admin Authentication

## 1. Azure Configuration

- [ ] 1.1 Create Entra ID app registration for Invoice Hub (or decide to use personal Microsoft account)
- [ ] 1.2 Enable App Service Authentication in Azure Portal
- [ ] 1.3 Configure Microsoft as identity provider
- [ ] 1.4 Set "Require authentication" for unauthenticated requests
- [ ] 1.5 Configure path exclusions for client portal (`/portal/*`, `/api/portal/*`)

## 2. Testing

- [ ] 2.1 Verify admin routes require Microsoft login
- [ ] 2.2 Verify admin API endpoints return 401 without auth
- [ ] 2.3 Verify client portal still works with token-based access
- [ ] 2.4 Test logout flow

## 3. Documentation

- [ ] 3.1 Document Easy Auth configuration in README or project docs
