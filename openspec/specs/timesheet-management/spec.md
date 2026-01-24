# timesheet-management Specification

## Purpose
TBD - created by archiving change add-timesheet-persistence. Update Purpose after archive.
## Requirements
### Requirement: Admin Timesheets Page

The admin portal SHALL provide a dedicated page for viewing and managing all timesheets.

#### Scenario: Navigate to timesheets page

- **WHEN** the admin clicks "Timesheets" in the navigation menu
- **THEN** the timesheets page is displayed
- **AND** the URL is `/timesheets`

#### Scenario: View timesheet list

- **WHEN** the admin views the timesheets page
- **THEN** a table displays all timesheets sorted by creation date (newest first)
- **AND** each row shows:
  - Client name
  - Month (formatted as "January 2026")
  - Status (with badge styling)
  - Total Hours
  - Created date
  - Approved date (if approved)
  - Invoice status (if invoice exists: draft/sent/paid, or "—" if none)

#### Scenario: View timesheet status

- **WHEN** the admin views a timesheet in the list
- **THEN** the status is displayed as a badge with appropriate styling:
  - "pending" - neutral/gray
  - "sent" - blue
  - "approved" - green
  - "rejected" - red

#### Scenario: View timesheet PDF

- **GIVEN** a timesheet has a PDF stored
- **WHEN** the admin clicks the "View PDF" action
- **THEN** the PDF opens in a new browser tab

#### Scenario: Empty state

- **WHEN** no timesheets exist
- **THEN** a helpful message is displayed indicating no timesheets have been created
- **AND** a prompt or link to create one from the dashboard is shown

### Requirement: Timesheet Details

The system SHALL allow viewing detailed information about a specific timesheet.

#### Scenario: View timesheet details

- **GIVEN** a timesheet exists
- **WHEN** the admin clicks on a timesheet row or detail action
- **THEN** detailed information is displayed including:
  - Client name
  - Month (formatted as "January 2026")
  - Status with timestamp (e.g., "Approved on Jan 15, 2026")
  - Total hours
  - Created date
  - Sent date (if sent)
  - Approved date (if approved)
  - PDF download link
  - Associated invoice details (if generated): invoice number, amount, status, PDF link

