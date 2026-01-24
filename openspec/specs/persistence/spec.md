# persistence Specification

## Purpose

Provide durable storage for application data using Azure SQL Database for structured data and Azure Blob Storage for PDF files.

## Requirements

### Requirement: Database Connection

The system SHALL connect to Azure SQL Database for persistent data storage using Azure Entra ID authentication.

#### Scenario: Successful database connection

- **GIVEN** valid Azure Entra ID credentials (managed identity or Azure CLI)
- **WHEN** the application starts
- **THEN** a connection to Azure SQL Database is established using `ActiveDirectoryDefault` authentication
- **AND** the connection pool is initialized

#### Scenario: Database connection failure

- **GIVEN** invalid or missing Azure Entra ID credentials
- **WHEN** the application attempts to connect
- **THEN** an error is logged with connection details (excluding secrets)
- **AND** the application fails gracefully with an appropriate error message

### Requirement: Azure Entra ID Authentication

The system SHALL authenticate to Azure SQL Database using Azure Entra ID, supporting both managed identity (production) and Azure CLI credentials (local development).

#### Scenario: Production authentication via managed identity

- **GIVEN** the application is running in Azure App Service
- **AND** system-assigned managed identity is enabled
- **AND** the identity has been granted database access
- **WHEN** the application connects to the database
- **THEN** authentication succeeds using the managed identity

#### Scenario: Local development authentication via Azure CLI

- **GIVEN** the developer has run `az login`
- **AND** their Azure Entra ID account has been granted database access
- **WHEN** the application connects to the database locally
- **THEN** authentication succeeds using Azure CLI credentials

#### Scenario: Authentication failure with helpful error

- **GIVEN** no valid Azure Entra ID credentials are available
- **WHEN** the application attempts to connect
- **THEN** an error message indicates the authentication method attempted
- **AND** suggests running `az login` for local development

### Requirement: Data Persistence Across Restarts

The system SHALL persist all application data to the database, ensuring data survives server restarts.

#### Scenario: Client data persists

- **GIVEN** a client has been created
- **WHEN** the server is restarted
- **THEN** the client data is still available after restart

#### Scenario: Timesheet data persists

- **GIVEN** a timesheet has been created
- **WHEN** the server is restarted
- **THEN** the timesheet data is still available after restart

#### Scenario: Settings data persists

- **GIVEN** settings have been configured (hourly rate, business profile)
- **WHEN** the server is restarted
- **THEN** the settings values are still available after restart

### Requirement: Client Repository

The system SHALL provide database-backed CRUD operations for Client entities.

#### Scenario: Create client

- **WHEN** a new client is created with valid data
- **THEN** the client is persisted to the database
- **AND** timestamps (createdAt, updatedAt) are automatically set

#### Scenario: Read clients

- **WHEN** clients are requested
- **THEN** all clients are returned from the database
- **AND** results are sorted by creation date (newest first)

#### Scenario: Update client

- **WHEN** a client is updated
- **THEN** the changes are persisted to the database
- **AND** the updatedAt timestamp is automatically updated

#### Scenario: Delete client with no dependencies

- **GIVEN** a client with no associated timesheets
- **WHEN** the client is deleted
- **THEN** the client is removed from the database

#### Scenario: Delete client with dependencies blocked

- **GIVEN** a client with associated timesheets
- **WHEN** deletion is attempted
- **THEN** the deletion is rejected
- **AND** an appropriate error message is returned

### Requirement: Timesheet Repository

The system SHALL provide database-backed CRUD operations for Timesheet entities.

#### Scenario: Create timesheet

- **WHEN** a new timesheet is created with valid data
- **THEN** the timesheet is persisted to the database with a foreign key to the client

#### Scenario: Query timesheet by client and month

- **GIVEN** timesheets exist in the database
- **WHEN** a timesheet is queried by clientId and month
- **THEN** the matching timesheet is returned (or null if not found)

#### Scenario: Update timesheet status

- **WHEN** a timesheet status is updated (e.g., pending → approved)
- **THEN** the status change is persisted to the database

### Requirement: Invoice Repository

The system SHALL provide database-backed CRUD operations for Invoice entities.

#### Scenario: Create invoice

- **WHEN** a new invoice is created with valid data
- **THEN** the invoice is persisted to the database with foreign keys to client and timesheet

#### Scenario: Query invoices by client

- **GIVEN** invoices exist in the database
- **WHEN** invoices are queried by clientId
- **THEN** all matching invoices are returned

### Requirement: Settings Repository

The system SHALL provide database-backed storage for application settings.

#### Scenario: Get hourly rate

- **WHEN** the hourly rate is requested
- **THEN** the current value is returned from the database
- **AND** null is returned if not yet configured

#### Scenario: Set hourly rate

- **WHEN** the hourly rate is set to a valid value
- **THEN** the value is persisted to the database
- **AND** the updatedAt timestamp is set

#### Scenario: Get business profile

- **WHEN** the business profile is requested
- **THEN** all profile fields are returned from the database

#### Scenario: Update business profile

- **WHEN** the business profile is updated with partial data
- **THEN** only the provided fields are updated
- **AND** the updatedAt timestamp is set

#### Scenario: Get and increment invoice number

- **WHEN** the next invoice number is requested
- **THEN** the current value is returned
- **AND** the stored value is atomically incremented by 1

### Requirement: Database Schema Migrations

The system SHALL use Prisma migrations to manage database schema changes.

#### Scenario: Initial migration

- **GIVEN** a new database with no tables
- **WHEN** migrations are run
- **THEN** all required tables are created (Client, Contact, Timesheet, Invoice, Settings)

#### Scenario: Schema evolution

- **GIVEN** an existing database with data
- **WHEN** a new migration is applied
- **THEN** the schema is updated without data loss

### Requirement: Azure Blob Storage

The system SHALL store PDF files in Azure Blob Storage for durable, scalable file storage.

#### Scenario: Upload PDF to blob storage

- **GIVEN** a PDF buffer and blob path
- **WHEN** uploadPdf is called
- **THEN** the PDF is uploaded to the configured Azure Blob container
- **AND** the blob URL is returned

#### Scenario: Download PDF from blob storage

- **GIVEN** a valid blob path
- **WHEN** downloadPdf is called
- **THEN** the PDF is downloaded and returned as a Buffer

#### Scenario: Delete PDF from blob storage

- **GIVEN** a valid blob path
- **WHEN** deletePdf is called
- **THEN** the blob is deleted from storage
- **AND** true is returned on success

#### Scenario: Blob storage connection failure

- **GIVEN** invalid Azure storage credentials
- **WHEN** any blob operation is attempted
- **THEN** an appropriate error is thrown

### Requirement: PDF Proxy Access

The system SHALL provide a proxy API endpoint to serve PDFs, as Azure Blob Storage does not permit public access.

#### Scenario: Serve PDF via proxy

- **GIVEN** a valid timesheet ID with an associated PDF
- **WHEN** GET /api/timesheets/[id]/pdf is called
- **THEN** the PDF is downloaded from blob storage
- **AND** streamed to the client with appropriate Content-Type headers

#### Scenario: PDF not found

- **GIVEN** a timesheet without an associated PDF
- **WHEN** GET /api/timesheets/[id]/pdf is called
- **THEN** a 404 error is returned

