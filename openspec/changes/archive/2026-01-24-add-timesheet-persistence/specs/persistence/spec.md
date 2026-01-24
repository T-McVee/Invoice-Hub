## ADDED Requirements

### Requirement: Azure Blob Storage Integration

The system SHALL store timesheet PDF documents in Azure Blob Storage for durable persistence.

#### Scenario: Upload timesheet PDF to blob storage

- **GIVEN** a timesheet PDF has been generated from Toggl
- **WHEN** the timesheet is created
- **THEN** the PDF is uploaded to blob storage at path `timesheets/{clientId}/{month}.pdf`
- **AND** the blob URL is stored in the timesheet record's `pdfUrl` field

#### Scenario: Blob storage authentication

- **GIVEN** the application is configured with Azure Storage credentials
- **WHEN** a blob operation is performed
- **THEN** authentication uses the same Azure Entra ID method as database access (managed identity in production, Azure CLI locally)

#### Scenario: Blob storage connection failure

- **GIVEN** blob storage is unavailable
- **WHEN** a document upload is attempted
- **THEN** the operation fails with a descriptive error
- **AND** the parent operation (timesheet/invoice creation) is rolled back

### Requirement: Client Portal Token

The system SHALL provide each client with a JWT-based portal access token for viewing their documents.

#### Scenario: Portal token generation on timesheet creation

- **GIVEN** a timesheet is being created for a client
- **WHEN** the timesheet creation succeeds
- **THEN** a new JWT is generated with the client ID and ~45 day expiry
- **AND** the JWT is stored in the client's `portalToken` field
- **AND** the token can be used to access the client portal at `/portal/{token}`

#### Scenario: Portal token validation

- **GIVEN** a client accesses the portal with a JWT token
- **WHEN** the token is validated
- **THEN** the system decodes the JWT to verify signature and check expiry
- **AND** extracts the client ID from the payload

#### Scenario: Expired token handling

- **GIVEN** a client accesses the portal with an expired JWT
- **WHEN** the token validation fails due to expiry
- **THEN** a page is displayed indicating the link has expired
- **AND** the client is instructed to contact the admin for a new link

#### Scenario: Admin regenerates portal token

- **GIVEN** a client exists in the system
- **WHEN** the admin clicks "Regenerate Portal Link" in the client detail view
- **THEN** a new JWT is generated with fresh expiry
- **AND** the old token is invalidated
- **AND** the admin can copy the new portal URL
