## MODIFIED Requirements

### Requirement: Duplicate Timesheet Prevention

The system SHALL warn the admin when a timesheet already exists for the same month and client, and allow replacement if confirmed.

#### Scenario: Detect existing timesheet before creation

- **GIVEN** the admin has selected a month and client
- **WHEN** a timesheet already exists for that combination
- **THEN** the system displays a warning indicating a timesheet already exists
- **AND** shows the existing timesheet's details (status, total hours, created date)
- **AND** prompts the admin to confirm if they want to replace it

#### Scenario: Confirm replacement of existing timesheet

- **GIVEN** the admin is warned about an existing timesheet
- **WHEN** the admin confirms they want to proceed
- **THEN** the existing timesheet is deleted
- **AND** a new timesheet is created with fresh data from Toggl
- **AND** the admin sees a success message

#### Scenario: Cancel replacement of existing timesheet

- **GIVEN** the admin is warned about an existing timesheet
- **WHEN** the admin cancels the operation
- **THEN** no changes are made
- **AND** the existing timesheet remains intact
