# email-notification Specification

## Purpose
TBD - created by archiving change automate-timesheet-email. Update Purpose after archive.
## Requirements
### Requirement: Timesheet Ready Notification

The system SHALL send an email notification to the client when a new timesheet is created.

#### Scenario: Send email with Primary Approver (TO + CC)
- **GIVEN** a client has a contact with `isPrimaryApprover=true`
- **AND** the client has other contacts with role `approver` or `both`
- **WHEN** a new timesheet is successfully created
- **THEN** the email TO field is set to the primary approver's email
- **AND** the CC field includes all other approver/both contacts
- **AND** the greeting uses the primary approver's name ("Hi {Name},")

#### Scenario: Email Link and Content
- **GIVEN** a timesheet for "January 2026"
- **WHEN** the email is generated
- **THEN** the subject is "January 2026 timesheet"
- **AND** the body contains a link to `{NEXT_PUBLIC_APP_URL}/portal/{token}`

#### Scenario: Email failure does not block timesheet creation
- **GIVEN** a timesheet creation request
- **WHEN** the timesheet is created successfully but the email fails to send
- **THEN** the timesheet is still persisted
- **AND** the API response includes `emailStatus: "failed"`
- **AND** the UI displays the failure with a retry option

#### Scenario: Retry email notification
- **GIVEN** a timesheet with `emailStatus: "failed"`
- **WHEN** the admin clicks the retry button
- **THEN** the system calls `POST /api/timesheets/[id]/notify`
- **AND** the email is re-attempted with the same recipient logic

