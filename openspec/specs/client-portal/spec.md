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

The client portal SHALL display the invoice number for each timesheet.

#### Scenario: View timesheet with invoice number

- **WHEN** the client views a timesheet in the portal
- **THEN** the invoice number is displayed (e.g., "#42")
- **AND** the month and total hours are shown
- **AND** if no invoice number is assigned (legacy records), it is omitted

### Requirement: Timesheet Approval

The client portal SHALL allow clients to approve pending timesheets and automatically trigger invoice generation.

#### Scenario: Approve a pending timesheet

- **GIVEN** a timesheet is in "pending" status
- **WHEN** the client clicks the "Approve" button
- **THEN** the timesheet status is updated to "approved"
- **AND** the `approvedAt` timestamp is recorded
- **AND** invoice generation is triggered automatically
- **AND** the UI updates to show the timesheet in the approved section
- **AND** a success message is displayed

#### Scenario: Approval succeeds but invoice generation fails

- **GIVEN** a timesheet is in "pending" status
- **AND** invoice generation will fail (missing config, API error)
- **WHEN** the client clicks the "Approve" button
- **THEN** the timesheet status is updated to "approved"
- **AND** the response includes `invoiceError` with a description
- **AND** the UI updates to show the timesheet as approved
- **AND** the client is not informed of the invoice error (admin handles it)

