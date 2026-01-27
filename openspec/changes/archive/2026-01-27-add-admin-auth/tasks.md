# Tasks: Add Admin Authentication

## 1. Azure Configuration

- [x] 1.1 Create Entra ID app registration for Invoice Hub with user assignment required
- [x] 1.2 Enable App Service Authentication in Azure Portal
- [x] 1.3 Configure Microsoft as identity provider
- [x] 1.4 Set "Require authentication" for unauthenticated requests
- [x] 1.5 Configure path exclusions for client portal (`/portal/*`, `/api/portal/*`)

## 2. Testing

- [x] 2.1 Verify admin routes require Microsoft login
- [x] 2.2 Verify admin API endpoints return 401 without auth
- [x] 2.3 Verify client portal still works with token-based access
- [x] 2.4 Test logout flow

## 3. Documentation

- [x] 3.1 Document Easy Auth configuration in README or project docs
