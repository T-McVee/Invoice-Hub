# persistence Specification Delta

## MODIFIED Requirements

### Requirement: Timesheet Repository

The system SHALL provide database-backed CRUD operations for Timesheet entities, including invoice number assignment.

#### Scenario: Create timesheet with invoice number

- **WHEN** a new timesheet is created
- **THEN** the timesheet is persisted with a unique `invoiceNumber`
- **AND** the `invoiceNumber` is obtained by calling `getAndIncrementNextInvoiceNumber()` from settings
- **AND** the settings `nextInvoiceNumber` is atomically incremented

#### Scenario: Force recreate timesheet preserves invoice number

- **GIVEN** a timesheet exists for a client and month with `invoiceNumber` N
- **WHEN** a new timesheet is created with `force=true` for the same client and month
- **THEN** the existing timesheet is deleted
- **AND** the new timesheet is created with the same `invoiceNumber` N
- **AND** the settings `nextInvoiceNumber` is NOT incremented

#### Scenario: Query timesheet includes invoice number

- **WHEN** timesheets are queried (by ID, by client, or listing all)
- **THEN** the `invoiceNumber` field is included in the response
