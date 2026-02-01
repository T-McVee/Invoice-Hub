## MODIFIED Requirements

### Requirement: Client CRUD Operations

The system SHALL provide full CRUD operations for client management.

#### Scenario: Create client manually

- **GIVEN** the user is on the client management page
- **WHEN** the user provides client details (name, togglProjectId, recipients, billingAddress)
- **THEN** a new client is created in the system

#### Scenario: Update client details

- **GIVEN** an existing client
- **WHEN** the user modifies client details including billing address
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
- **THEN** the user can modify name, notes, billing address, and recipient email lists

## ADDED Requirements

### Requirement: Client Billing Address

The system SHALL store an optional billing address for each client.

#### Scenario: Store billing address

- **GIVEN** an existing client
- **WHEN** the user enters a billing address (multi-line text)
- **THEN** the billing address is saved to the client record

#### Scenario: Billing address is optional

- **GIVEN** a client without a billing address
- **WHEN** the client is saved
- **THEN** the client record is valid with a null billing address
