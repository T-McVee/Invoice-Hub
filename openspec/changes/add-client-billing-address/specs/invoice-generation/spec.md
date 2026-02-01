## MODIFIED Requirements

### Requirement: Invoice Payload Compilation

The system SHALL compile invoice data from timesheet, client, and business profile into the format required by invoice-generator.com.

#### Scenario: Compile complete invoice payload

- **GIVEN** an approved timesheet, client record, business profile, and hourly rate
- **WHEN** `compileInvoicePayload()` is called
- **THEN** a payload is returned with:
  - `from`: Business details (name, business number, GST, phone, email, address)
  - `to`: Client name and billing address (if provided)
  - `number`: Timesheet ID (e.g., "1234")
  - `date`: Current date in "DD MM YYYY" format
  - `due_date`: Calculated based on payment terms
  - `items`: Single line item with service description, quantity=1, unit_cost=total
  - `tax`: Tax percentage from business profile
  - `terms`: Payment terms from business profile
  - `notes`: Payment details from business profile

#### Scenario: Compile invoice with client billing address

- **GIVEN** a client with a billing address configured
- **WHEN** an invoice is generated for that client
- **THEN** the `to` field includes the client name on the first line
- **AND** the billing address appears on new lines below the name (newline-separated)

#### Scenario: Compile invoice without client billing address

- **GIVEN** a client without a billing address
- **WHEN** an invoice is generated for that client
- **THEN** the `to` field contains only the client name

#### Scenario: Calculate invoice amount

- **GIVEN** total hours, hourly rate, and tax rate
- **WHEN** `calculateInvoiceAmount()` is called
- **THEN** the total is calculated as `(hours × rate) × (1 + taxRate/100)`
- **AND** the result is rounded to 2 decimal places

#### Scenario: Calculate due date from payment terms

- **GIVEN** an invoice date and payment terms number (e.g., `15`)
- **WHEN** `calculateDueDate(invoiceDate, paymentTermsDays)` is called
- **THEN** the due date is calculated by adding the days to the invoice date

#### Scenario: Format payment terms string

- **GIVEN** a payment terms number (e.g., `15`)
- **WHEN** `formatPaymentTerms(paymentTermsDays)` is called
- **THEN** a formatted string is returned (e.g., "Please pay within 15 days")
