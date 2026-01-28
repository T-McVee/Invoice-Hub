# client-portal Specification Delta

## MODIFIED Requirements

### Requirement: Client Timesheet Viewing

The client portal SHALL display the invoice number for each timesheet.

#### Scenario: View timesheet with invoice number

- **WHEN** the client views a timesheet in the portal
- **THEN** the invoice number is displayed (e.g., "#42")
- **AND** the month and total hours are shown
- **AND** if no invoice number is assigned (legacy records), it is omitted
