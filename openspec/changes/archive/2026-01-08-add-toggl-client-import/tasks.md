# Tasks: Add Toggl Client Import with Enhanced Metadata

## 1. Backend - Toggl API Integration

- [x] 1.1 Add `TogglClient` interface to `src/lib/toggl/client.ts` with Toggl API response fields
- [x] 1.2 Add `fetchClients()` function to fetch clients from Toggl API
- [x] 1.3 Create `GET /api/toggl/clients` endpoint to expose Toggl clients to frontend

## 2. Backend - Data Model Updates

- [x] 2.1 Extend `Client` interface in `src/types/index.ts` with new fields (`togglClientId`, `timesheetRecipients`, `invoiceRecipients`, `notes`)
- [x] 2.2 Update mock data store to support new client fields
- [x] 2.3 Add `createClient()` and `updateClient()` functions to mock data store

## 3. Backend - Client API Endpoints

- [x] 3.1 Add `POST /api/clients` endpoint to create new clients (with Toggl import support)
- [x] 3.2 Add `PATCH /api/clients/[id]` endpoint to update client metadata
- [x] 3.3 Add `DELETE /api/clients/[id]` endpoint to remove clients

## 4. Frontend - Client Management UI

- [x] 4.1 Create client list page at `src/app/(admin)/clients/page.tsx`
- [x] 4.2 Add "Import from Toggl" dialog component to select and import Toggl clients
- [x] 4.3 Add client edit form for managing recipient emails and other metadata
- [x] 4.4 Add navigation link to clients page in admin layout (already existed)
