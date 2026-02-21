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

### Requirement: Invoice Delivery Notification

The system SHALL send an email with the invoice PDF attached to billing contacts when an invoice is generated.

#### Scenario: Send invoice email to billing contacts
- **GIVEN** an invoice has been successfully generated for a client
- **AND** the client has a contact with `isPrimaryBilling=true`
- **WHEN** the invoice email is sent
- **THEN** the email TO field is set to the primary billing contact's email
- **AND** the CC field includes all other contacts with role `billing` or `both`
- **AND** the greeting uses the primary billing contact's name
- **AND** the invoice PDF is attached to the email

#### Scenario: Invoice email content
- **GIVEN** an invoice for "January 2026" with invoice number "42"
- **WHEN** the email is generated
- **THEN** the subject is "Invoice #42 - January 2026"
- **AND** the body states the invoice is attached
- **AND** the PDF attachment filename is `invoice-42-jan-2026.pdf`

#### Scenario: No primary billing contact configured
- **GIVEN** a client has no contact with `isPrimaryBilling=true`
- **WHEN** invoice email sending is attempted
- **THEN** the email is not sent
- **AND** the result indicates "No primary billing contact configured"
- **AND** the invoice remains in `draft` status

#### Scenario: Invoice email failure does not block approval
- **GIVEN** a timesheet is approved and an invoice is generated
- **WHEN** the invoice email fails to send
- **THEN** the timesheet remains approved
- **AND** the invoice remains in `draft` status
- **AND** the approval response includes `invoiceEmailStatus: "failed"`

#### Scenario: Manual invoice send from admin
- **GIVEN** an invoice in `draft` status
- **WHEN** the admin triggers `POST /api/invoices/[id]/send`
- **THEN** the invoice email is sent to billing contacts using the same recipient logic
- **AND** on success the invoice status is updated to `sent` with `sentAt` timestamp

#### Scenario: Resend invoice email
- **GIVEN** an invoice in `sent` status
- **WHEN** the admin triggers `POST /api/invoices/[id]/send`
- **THEN** the invoice email is re-sent to billing contacts
- **AND** the `sentAt` timestamp is updated to the current time

