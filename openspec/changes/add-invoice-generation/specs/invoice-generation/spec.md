## ADDED Requirements

### Requirement: Invoice Generator API Client

The system SHALL provide an API client for invoice-generator.com to generate invoice PDFs.

#### Scenario: Generate invoice PDF successfully

- **GIVEN** a valid invoice payload with from, to, items, tax, and terms
- **WHEN** `generateInvoicePdf(payload)` is called
- **THEN** the payload is sent as JSON POST to `https://invoice-generator.com`
- **AND** the response PDF buffer is returned

#### Scenario: API error handling

- **GIVEN** invoice-generator.com returns an error response
- **WHEN** `generateInvoicePdf(payload)` is called
- **THEN** an error is thrown with the status code and error message

### Requirement: Invoice Payload Compilation

The system SHALL compile invoice data from timesheet, client, and business profile into the format required by invoice-generator.com.

#### Scenario: Compile complete invoice payload

- **GIVEN** an approved timesheet, client record, business profile, and hourly rate
- **WHEN** `compileInvoicePayload()` is called
- **THEN** a payload is returned with:
  - `from`: Business details (name, business number, GST, phone, email, address)
  - `to`: Client name
  - `number`: Timesheet ID (e.g., "1234")
  - `date`: Current date in "DD MM YYYY" format
  - `due_date`: Calculated based on payment terms
  - `items`: Single line item with service description, quantity=1, unit_cost=total
  - `tax`: Tax percentage from business profile
  - `terms`: Payment terms from business profile
  - `notes`: Payment details from business profile

#### Scenario: Calculate invoice amount

- **GIVEN** total hours, hourly rate, and tax rate
- **WHEN** `calculateInvoiceAmount()` is called
- **THEN** the total is calculated as `(hours × rate) × (1 + taxRate/100)`
- **AND** the result is rounded to 2 decimal places

#### Scenario: Calculate due date from payment terms

- **GIVEN** an invoice date and payment terms string (e.g., "Please pay within 15 days")
- **WHEN** `calculateDueDate()` is called
- **THEN** the number of days is extracted from the terms
- **AND** the due date is calculated by adding those days to the invoice date

### Requirement: Invoice Generation on Approval

The system SHALL automatically generate an invoice when a timesheet is approved.

#### Scenario: Successful invoice generation

- **GIVEN** a client approves a pending timesheet
- **AND** business profile and hourly rate are configured
- **WHEN** the approval request completes
- **THEN** an invoice is generated via invoice-generator.com
- **AND** the PDF is uploaded to blob storage at `invoices/{clientId}/{timesheetId}.pdf`
- **AND** an Invoice record is created with status "draft"
- **AND** the response includes both timesheet and invoice data

#### Scenario: Invoice generation fails gracefully

- **GIVEN** a client approves a pending timesheet
- **AND** invoice generation fails (API error, missing config, etc.)
- **WHEN** the approval request completes
- **THEN** the timesheet is still marked as approved
- **AND** the response includes `invoiceError` describing the failure
- **AND** `invoice` is null in the response

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
