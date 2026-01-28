# timesheet-management Specification Delta

## MODIFIED Requirements

### Requirement: Admin Timesheets Page

The admin portal SHALL display the invoice number for each timesheet.

#### Scenario: View timesheet list with invoice number

- **WHEN** the admin views the timesheets page
- **THEN** each row shows:
  - Invoice number (e.g., "42") or "—" if not assigned (legacy records)
  - Client name
  - Month (formatted as "January 2026")
  - Status (with badge styling)
  - Total Hours
  - Created date
  - Approved date (if approved)
  - Invoice status (if invoice exists: draft/sent/paid, or "—" if none)

### Requirement: Timesheet Details

The system SHALL display the invoice number in timesheet details.

#### Scenario: View timesheet details with invoice number

- **GIVEN** a timesheet exists
- **WHEN** the admin clicks on a timesheet row or detail action
- **THEN** detailed information includes the invoice number (or "Not assigned" for legacy records)

### Requirement: Admin Dashboard Recent Activity

The admin dashboard SHALL display invoice numbers in the recent activity section.

#### Scenario: View recent timesheets with invoice number

- **WHEN** the admin views the dashboard
- **THEN** the recent activity section shows timesheets with their invoice number (e.g., "Timesheet #42 - January 2026")
