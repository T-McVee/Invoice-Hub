## ADDED Requirements

### Requirement: Invoice Blob Storage Path

The system SHALL provide a helper function to generate consistent blob storage paths for invoice PDFs.

#### Scenario: Generate invoice blob path

- **GIVEN** a client ID and timesheet ID
- **WHEN** `getInvoiceBlobPath(clientId, timesheetId)` is called
- **THEN** a path is returned in the format `invoices/{clientId}/{timesheetId}.pdf`
