# Change: Add Toggl Client Import with Enhanced Metadata

## Why

Currently, clients must be manually configured in the mock data store. The Toggl Track API provides a clients endpoint (`GET /api/v9/workspaces/{workspace_id}/clients`) that allows fetching existing clients from Toggl. By integrating this endpoint, users can import client data from Toggl and enrich it with app-specific metadata like timesheet recipient emails and invoice recipient emails.

## What Changes

- Add `fetchClients()` function to the Toggl API client to fetch clients from Toggl Track
- Extend the `Client` type to include:
  - `togglClientId` - The Toggl client ID (distinct from `togglProjectId` which links to a project)
  - `timesheetRecipients` - Array of email addresses for timesheet notifications
  - `invoiceRecipients` - Array of email addresses for invoice notifications
  - `notes` - Optional notes/metadata field
- Add API endpoint to fetch available Toggl clients for import
- Add API endpoint to create/update clients with the enhanced metadata
- Add admin UI for importing Toggl clients and managing recipient emails

**Out of Scope:**

- Toggl project selection/linking (kept as separate manual configuration)
- Azure SQL Database migration (MVP uses in-memory mock store, migration is future work)

**Persistence:**

- MVP: Continue using in-memory mock data store (`src/lib/db/mock-data.ts`)
- Future: Migrate to Azure SQL Database (schema designed, ready for migration)

## Impact

- Affected specs: `client-management` (new capability)
- Affected code:
  - `src/lib/toggl/client.ts` - Add `fetchClients()` function
  - `src/types/index.ts` - Extend `Client` interface
  - `src/lib/db/mock-data.ts` - Update client data structure
  - `src/app/api/clients/route.ts` - Add POST endpoint for client creation
  - `src/app/api/toggl/clients/route.ts` - New endpoint to fetch Toggl clients
  - `src/app/(admin)/clients/page.tsx` - New client management page
