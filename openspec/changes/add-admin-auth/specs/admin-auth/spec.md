## ADDED Requirements

### Requirement: Admin Password Authentication

The system SHALL authenticate the admin user via password before granting access to the admin portal.

#### Scenario: Successful login
- **WHEN** the admin submits the correct password on the login page
- **THEN** a session cookie is set and the admin is redirected to the dashboard

#### Scenario: Failed login
- **WHEN** the admin submits an incorrect password
- **THEN** an error message is displayed and no session is created

#### Scenario: Password storage
- **WHEN** the system verifies the admin password
- **THEN** it compares against a bcrypt hash stored in the `ADMIN_PASSWORD_HASH` environment variable

### Requirement: Session Management

The system SHALL maintain admin sessions using secure HTTP-only cookies.

#### Scenario: Session cookie properties
- **WHEN** a session is created after successful login
- **THEN** the cookie is set with `HttpOnly`, `Secure` (in production), and `SameSite=Lax` flags

#### Scenario: Session expiry
- **WHEN** 24 hours have passed since login
- **THEN** the session expires and the admin must log in again

#### Scenario: Logout
- **WHEN** the admin clicks the logout button
- **THEN** the session cookie is cleared and the admin is redirected to the login page

### Requirement: Admin Route Protection

The system SHALL protect all admin portal routes from unauthenticated access.

#### Scenario: Unauthenticated access to admin route
- **WHEN** an unauthenticated user attempts to access `/dashboard`, `/timesheets`, `/clients`, `/settings`, or other admin routes
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated access to admin route
- **WHEN** an authenticated admin accesses an admin route
- **THEN** the page renders normally

#### Scenario: Authenticated access to login page
- **WHEN** an authenticated admin navigates to `/login`
- **THEN** they are redirected to `/dashboard`

### Requirement: Admin API Protection

The system SHALL protect all admin API endpoints from unauthenticated access.

#### Scenario: Unauthenticated API request
- **WHEN** an unauthenticated request is made to an admin API endpoint
- **THEN** the response is `401 Unauthorized`

#### Scenario: Authenticated API request
- **WHEN** an authenticated request (with valid session cookie) is made to an admin API endpoint
- **THEN** the request is processed normally

#### Scenario: Protected endpoints
- **WHEN** categorizing API endpoints
- **THEN** the following require admin authentication:
  - `/api/clients/*`
  - `/api/timesheets/*`
  - `/api/settings/*`
  - `/api/metrics/*`
  - `/api/toggl/*`
- **AND** the following remain publicly accessible:
  - `/api/portal/*` (uses client token authentication)
  - `/api/auth/*` (login/logout endpoints)
