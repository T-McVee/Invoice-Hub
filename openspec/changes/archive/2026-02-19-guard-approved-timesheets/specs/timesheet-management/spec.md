## ADDED Requirements
### Requirement: Approved Timesheet Protection

The system SHALL prevent force-regeneration of timesheets that have been approved, to preserve invoice integrity.

#### Scenario: Block force-regeneration of approved timesheet

- **GIVEN** a timesheet exists for a client and month with status `approved`
- **WHEN** a POST request is made to `/api/timesheets` with the same `clientId`, `month`, and `force=true`
- **THEN** the system returns HTTP 409
- **AND** the error message explains that approved timesheets cannot be regenerated
- **AND** the error message suggests revoking or deleting the associated invoice first
- **AND** the existing timesheet and its associated invoices are NOT modified or deleted

#### Scenario: Allow force-regeneration of non-approved timesheet

- **GIVEN** a timesheet exists for a client and month with status `pending`, `sent`, or `rejected`
- **WHEN** a POST request is made to `/api/timesheets` with the same `clientId`, `month`, and `force=true`
- **THEN** the existing timesheet is deleted and regenerated as normal
