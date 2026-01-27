# Change: Add Admin Dashboard Authentication

## Why

The admin portal currently has no authentication. Anyone with the URL can access the dashboard, manage clients, view timesheets, and modify settings. This also means admin-only API endpoints (e.g., `/api/timesheets/[id]/pdf`) are publicly accessible, creating a security gap.

## What Changes

- Enable Azure App Service Authentication (Easy Auth) with Microsoft Entra ID
- All admin routes and API endpoints protected at the infrastructure level
- Only authorized Microsoft account(s) can access the admin portal
- No application code changes required for auth - Azure handles it

## Impact

- **Affected specs**: New `admin-auth` capability
- **Affected code**: None - Easy Auth is configured at the Azure platform level
- **Azure configuration**:
  - App Service Authentication enabled
  - Microsoft Entra ID identity provider configured
  - Authorized users/groups specified
- **Environment**: No new environment variables needed
