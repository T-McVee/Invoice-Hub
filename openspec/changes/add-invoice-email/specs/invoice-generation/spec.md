## MODIFIED Requirements
### Requirement: Invoice Generation on Approval

The system SHALL automatically generate an invoice and send it to billing contacts when a timesheet is approved.

#### Scenario: Successful invoice generation
- **GIVEN** a client approves a pending timesheet
- **AND** business profile and hourly rate are configured
- **WHEN** the approval request completes
- **THEN** an invoice is generated via invoice-generator.com
- **AND** the PDF is uploaded to blob storage at `invoices/{clientId}/{timesheetId}.pdf`
- **AND** an Invoice record is created with status "draft"
- **AND** the invoice email is sent to billing contacts
- **AND** on successful email, the invoice status is updated to "sent" with `sentAt` timestamp
- **AND** the response includes both timesheet and invoice data

#### Scenario: Invoice generation fails gracefully
- **GIVEN** a client approves a pending timesheet
- **AND** invoice generation fails (API error, missing config, etc.)
- **WHEN** the approval request completes
- **THEN** the timesheet is still marked as approved
- **AND** the response includes `invoiceError` describing the failure
- **AND** `invoice` is null in the response

#### Scenario: Invoice email fails gracefully
- **GIVEN** a client approves a pending timesheet
- **AND** invoice generation succeeds but email sending fails
- **WHEN** the approval request completes
- **THEN** the timesheet is still marked as approved
- **AND** the invoice is created with status "draft"
- **AND** the response includes `invoiceEmailError` describing the failure

#### Scenario: Missing hourly rate
- **GIVEN** a client approves a pending timesheet
- **AND** hourly rate is not configured
- **WHEN** invoice generation is attempted
- **THEN** invoice generation fails with "Hourly rate not configured"
- **AND** timesheet approval succeeds

#### Scenario: Missing client
- **GIVEN** a client approves a pending timesheet
- **AND** the client record cannot be found
- **WHEN** invoice generation is attempted
- **THEN** invoice generation fails with "Client not found"
- **AND** timesheet approval succeeds
