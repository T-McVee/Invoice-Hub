# timesheet-management Specification Delta

## MODIFIED Requirements

### Requirement: Admin Timesheets Page

The admin portal SHALL provide a dedicated page for viewing and managing all timesheets.

#### Scenario: View timesheet list

- **WHEN** the admin views the timesheets page
- **THEN** a table displays all timesheets sorted by creation date (newest first)
- **AND** each row shows:
  - Invoice number (e.g., "42") or "—" if not assigned (legacy records)
  - Client name
  - Month (formatted as "January 2026")
  - Status (with badge styling)
  - Total Hours
  - Created date
  - Approved date (if approved)
  - Invoice status (if invoice exists: draft/sent/paid, or "—" if none)

### Requirement: Timesheet Details

The system SHALL allow viewing detailed information about a specific timesheet.

#### Scenario: View timesheet details

- **GIVEN** a timesheet exists
- **WHEN** the admin clicks on a timesheet row or detail action
- **THEN** detailed information is displayed including:
  - Invoice number (or "Not assigned" for legacy records)
  - Client name
  - Month (formatted as "January 2026")
  - Status with timestamp (e.g., "Approved on Jan 15, 2026")
  - Total hours
  - Created date
  - Sent date (if sent)
  - Approved date (if approved)
  - PDF download link
  - Associated invoice details (if generated): invoice number, amount, status, PDF link

## NEW Requirements

### Requirement: Admin Dashboard Recent Activity

The admin dashboard SHALL display invoice numbers in the recent activity section.

#### Scenario: View recent timesheets with invoice number

- **WHEN** the admin views the dashboard
- **THEN** the recent activity section shows timesheets with their invoice number (e.g., "Timesheet #42 - January 2026")
