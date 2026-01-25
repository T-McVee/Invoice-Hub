## ADDED Requirements

### Requirement: Authenticated Portal PDF Access

The system SHALL provide an authenticated API endpoint for portal users to access PDFs, verifying both token validity and resource ownership.

#### Scenario: Serve PDF via authenticated portal endpoint

- **GIVEN** a valid portal JWT token
- **AND** a timesheet ID that belongs to the authenticated client
- **WHEN** GET /api/portal/[token]/timesheets/[id]/pdf is called
- **THEN** the JWT is validated (signature and expiry checked)
- **AND** the timesheet ownership is verified (timesheet.clientId matches token.clientId)
- **AND** the PDF is downloaded from blob storage
- **AND** streamed to the client with appropriate Content-Type headers

#### Scenario: PDF access denied for unowned timesheet

- **GIVEN** a valid portal JWT token
- **AND** a timesheet ID that belongs to a different client
- **WHEN** GET /api/portal/[token]/timesheets/[id]/pdf is called
- **THEN** a 403 Forbidden response is returned
- **AND** no PDF content is streamed

#### Scenario: PDF access denied for invalid token

- **GIVEN** an invalid or expired JWT token
- **WHEN** GET /api/portal/[token]/timesheets/[id]/pdf is called
- **THEN** a 401 Unauthorized response is returned
- **AND** no PDF content is streamed

#### Scenario: PDF not found via portal endpoint

- **GIVEN** a valid portal JWT token
- **AND** a timesheet without an associated PDF
- **WHEN** GET /api/portal/[token]/timesheets/[id]/pdf is called
- **THEN** a 404 error is returned
