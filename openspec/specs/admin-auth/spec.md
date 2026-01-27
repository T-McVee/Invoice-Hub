# admin-auth Specification

## Purpose
Protect the admin portal using Azure App Service Authentication (Easy Auth) with Microsoft Entra ID, while preserving token-based access for the client portal.
## Requirements
### Requirement: Azure Easy Auth Protection

The system SHALL use Azure App Service Authentication (Easy Auth) to protect the admin portal.

#### Scenario: Unauthenticated access to admin route
- **WHEN** an unauthenticated user attempts to access `/dashboard`, `/timesheets`, `/clients`, `/settings`, or other admin routes
- **THEN** they are redirected to Microsoft's login page

#### Scenario: Successful authentication
- **WHEN** a user successfully authenticates with an authorized Microsoft account
- **THEN** they are granted access to the admin portal

#### Scenario: Unauthorized Microsoft account
- **WHEN** a user authenticates with a Microsoft account that is not authorized
- **THEN** they are denied access to the admin portal

### Requirement: Admin API Protection

The system SHALL protect all admin API endpoints via Easy Auth.

#### Scenario: Unauthenticated API request
- **WHEN** an unauthenticated request is made to an admin API endpoint
- **THEN** the response is `401 Unauthorized`

#### Scenario: Protected endpoints
- **WHEN** categorizing API endpoints for Easy Auth protection
- **THEN** the following require authentication:
  - `/api/clients/*`
  - `/api/timesheets/*`
  - `/api/settings/*`
  - `/api/metrics/*`
  - `/api/toggl/*`

### Requirement: Client Portal Exclusion

The system SHALL exclude client portal routes from Easy Auth to allow token-based client access.

#### Scenario: Client portal access
- **WHEN** a client accesses `/portal/[token]` with a valid client token
- **THEN** they are granted access without Microsoft authentication

#### Scenario: Client portal API access
- **WHEN** a request is made to `/api/portal/*` with a valid client token
- **THEN** the request is processed using the existing JWT-based client authentication

#### Scenario: Excluded paths
- **WHEN** configuring Easy Auth path exclusions
- **THEN** the following paths allow unauthenticated access:
  - `/portal/*`
  - `/api/portal/*`

