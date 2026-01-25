# client-portal Specification

## Purpose
TBD - created by archiving change add-timesheet-persistence. Update Purpose after archive.
## Requirements
### Requirement: Client Portal Access

The client portal SHALL provide secure, JWT-based access for clients to view their documents.

#### Scenario: Access portal with valid JWT

- **GIVEN** a client has a valid (non-expired) portal JWT
- **WHEN** the client navigates to `/portal/{token}`
- **THEN** the JWT is validated (signature and expiry checked)
- **AND** the portal displays the client's name and their documents
- **AND** no login is required

#### Scenario: Access portal with expired JWT

- **GIVEN** a client's portal JWT has expired
- **WHEN** the client navigates to `/portal/{token}`
- **THEN** a page is displayed indicating the link has expired
- **AND** the client is instructed to contact the admin for a new link
- **AND** no client data is exposed

#### Scenario: Access portal with invalid JWT

- **GIVEN** an invalid or malformed JWT is used
- **WHEN** the client navigates to `/portal/{token}`
- **THEN** an error message is displayed indicating the link is invalid
- **AND** no client data is exposed

### Requirement: Client Timesheet Viewing

The client portal SHALL display all timesheets for the client, organized by status.

#### Scenario: View pending timesheets

- **WHEN** the client views their portal
- **THEN** pending timesheets awaiting approval are prominently displayed
- **AND** each shows the month, total hours, and an "Approve" action

#### Scenario: View approved timesheets

- **WHEN** the client views their portal
- **THEN** previously approved timesheets are displayed in a history section
- **AND** each shows the month, total hours, approval date, and PDF download link

#### Scenario: Download timesheet PDF

- **GIVEN** a timesheet exists for the client
- **AND** the client has a valid portal JWT token
- **WHEN** the client clicks the PDF download link
- **THEN** the request includes the portal token for authentication
- **AND** the system verifies the timesheet belongs to the authenticated client
- **AND** the timesheet PDF is downloaded or opened in a new tab

#### Scenario: Download PDF for unowned timesheet rejected

- **GIVEN** a timesheet exists but belongs to a different client
- **AND** the client has a valid portal JWT token
- **WHEN** the client attempts to access the PDF
- **THEN** a 403 Forbidden response is returned
- **AND** no PDF content is exposed

#### Scenario: No timesheets available

- **WHEN** the client has no timesheets
- **THEN** a message indicates no timesheets are available yet

### Requirement: Timesheet Approval

The client portal SHALL allow clients to approve pending timesheets.

#### Scenario: Approve a pending timesheet

- **GIVEN** a timesheet is in "pending" status
- **WHEN** the client clicks the "Approve" button
- **THEN** the timesheet status is updated to "approved"
- **AND** the `approvedAt` timestamp is recorded
- **AND** the UI updates to show the timesheet in the approved section
- **AND** a success message is displayed

