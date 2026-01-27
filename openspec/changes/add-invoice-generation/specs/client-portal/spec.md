## MODIFIED Requirements

### Requirement: Timesheet Approval

The client portal SHALL allow clients to approve pending timesheets and automatically trigger invoice generation.

#### Scenario: Approve a pending timesheet

- **GIVEN** a timesheet is in "pending" status
- **WHEN** the client clicks the "Approve" button
- **THEN** the timesheet status is updated to "approved"
- **AND** the `approvedAt` timestamp is recorded
- **AND** invoice generation is triggered automatically
- **AND** the UI updates to show the timesheet in the approved section
- **AND** a success message is displayed

#### Scenario: Approval succeeds but invoice generation fails

- **GIVEN** a timesheet is in "pending" status
- **AND** invoice generation will fail (missing config, API error)
- **WHEN** the client clicks the "Approve" button
- **THEN** the timesheet status is updated to "approved"
- **AND** the response includes `invoiceError` with a description
- **AND** the UI updates to show the timesheet as approved
- **AND** the client is not informed of the invoice error (admin handles it)
