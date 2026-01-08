# client-management Specification

## Purpose
TBD - created by archiving change add-toggl-client-import. Update Purpose after archive.
## Requirements
### Requirement: Toggl Client Fetch

The system SHALL provide an API to fetch available clients from the Toggl Track workspace.

#### Scenario: Successful client fetch

- **GIVEN** valid Toggl API credentials are configured
- **WHEN** a request is made to fetch Toggl clients
- **THEN** the system returns a list of clients from the Toggl workspace including id, name, and notes

#### Scenario: Toggl API authentication failure

- **GIVEN** invalid or missing Toggl API credentials
- **WHEN** a request is made to fetch Toggl clients
- **THEN** the system returns an authentication error with appropriate message

### Requirement: Client Import from Toggl

The system SHALL allow importing clients from Toggl into the application.

#### Scenario: Import new client from Toggl

- **GIVEN** a Toggl client that does not exist in the application
- **WHEN** the user imports the client
- **THEN** a new Client record is created with the Toggl client ID and name populated

#### Scenario: Import client already exists

- **GIVEN** a Toggl client that already exists in the application (matched by togglClientId)
- **WHEN** the user attempts to import the client
- **THEN** the system notifies the user that the client already exists

### Requirement: Client Recipient Management

The system SHALL allow storing timesheet and invoice recipient email addresses for each client.

#### Scenario: Add timesheet recipients

- **GIVEN** an existing client
- **WHEN** the user adds email addresses to timesheet recipients
- **THEN** the client record is updated with the new recipient emails

#### Scenario: Add invoice recipients

- **GIVEN** an existing client
- **WHEN** the user adds email addresses to invoice recipients
- **THEN** the client record is updated with the new invoice recipient emails

#### Scenario: Validate email format

- **GIVEN** a client being updated with recipient emails
- **WHEN** an invalid email format is provided
- **THEN** the system rejects the update with a validation error

### Requirement: Client CRUD Operations

The system SHALL provide full CRUD operations for client management.

#### Scenario: Create client manually

- **GIVEN** the user is on the client management page
- **WHEN** the user provides client details (name, togglProjectId, recipients)
- **THEN** a new client is created in the system

#### Scenario: Update client details

- **GIVEN** an existing client
- **WHEN** the user modifies client details
- **THEN** the client record is updated with the new values

#### Scenario: Delete client

- **GIVEN** an existing client with no associated timesheets or invoices
- **WHEN** the user deletes the client
- **THEN** the client is removed from the system

#### Scenario: Prevent deletion with associated data

- **GIVEN** a client with existing timesheets or invoices
- **WHEN** the user attempts to delete the client
- **THEN** the system prevents deletion and displays an appropriate message

### Requirement: Client Management UI

The system SHALL provide an admin interface for managing clients.

#### Scenario: View client list

- **GIVEN** the user navigates to the clients page
- **WHEN** the page loads
- **THEN** a list of all clients is displayed with name and recipient count

#### Scenario: Import dialog

- **GIVEN** the user is on the clients page
- **WHEN** the user clicks "Import from Toggl"
- **THEN** a dialog displays available Toggl clients not yet imported

#### Scenario: Edit client metadata

- **GIVEN** the user clicks on a client in the list
- **WHEN** the edit form opens
- **THEN** the user can modify name, notes, and recipient email lists

