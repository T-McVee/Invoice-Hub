## ADDED Requirements

### Requirement: Dashboard Timesheet Creation Controls

The admin dashboard SHALL provide controls to create a new timesheet for a selected month and client.

#### Scenario: Display creation form

- **WHEN** the admin navigates to the dashboard
- **THEN** a "Create Timesheet" form is displayed with month selector and client selector

#### Scenario: Select month for timesheet

- **WHEN** the admin interacts with the month selector
- **THEN** they can choose any past month (year and month combination)

#### Scenario: Select client for timesheet

- **WHEN** the admin interacts with the client selector
- **THEN** they see a list of available clients to choose from

### Requirement: Timesheet Creation Submission

The system SHALL create a timesheet record and fetch data from Toggl when the admin submits the creation form.

#### Scenario: Successful timesheet creation

- **GIVEN** the admin has selected a valid month and client
- **WHEN** the admin submits the creation form
- **THEN** the system fetches time entries from Toggl for the selected month and client's project
- **AND** the system fetches or generates the detailed timesheet PDF from Toggl
- **AND** a timesheet record is stored with status "pending", total hours, and PDF URL
- **AND** the admin sees a success message with the timesheet summary

#### Scenario: Creation with loading state

- **WHEN** the admin submits the creation form
- **THEN** the form displays a loading indicator
- **AND** the submit button is disabled until the operation completes

#### Scenario: Creation failure handling

- **GIVEN** the admin submits the creation form
- **WHEN** the Toggl API call fails or another error occurs
- **THEN** the admin sees an error message describing the failure
- **AND** no timesheet record is created

### Requirement: Duplicate Timesheet Prevention

The system SHALL prevent creating duplicate timesheets for the same month and client combination.

#### Scenario: Attempt to create duplicate timesheet

- **GIVEN** a timesheet already exists for a specific month and client
- **WHEN** the admin attempts to create another timesheet for the same month and client
- **THEN** the system displays an error indicating a timesheet already exists
- **AND** no new timesheet record is created
