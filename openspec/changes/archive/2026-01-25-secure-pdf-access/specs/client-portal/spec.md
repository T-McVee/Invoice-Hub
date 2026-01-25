## MODIFIED Requirements

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
