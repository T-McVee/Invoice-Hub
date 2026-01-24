# Change: Add Timesheet Persistence and Client Portal Approval

## Why

Timesheets are currently created but not persisted beyond the local filesystem (`/tmp`). To progress the core workflow (create timesheet → client approves → invoice generated), we need to:
1. Store timesheet PDFs durably in Azure Blob Storage
2. Provide an admin view of all timesheets and their statuses
3. Enable clients to view and approve timesheets via their portal

Invoice generation will be added in a follow-up change.

## What Changes

- **Blob Storage**: Add Azure Blob Storage integration for PDF persistence
- **Duplicate Handling**: When a timesheet exists for a client/month, prompt user to confirm replacement instead of blocking
- **Admin Timesheets Page**: New page listing all timesheets with status, client, month, and actions
- **Client Portal**: Implement timesheet viewing and approval functionality using JWT-based tokens (~45 day expiry, refreshed on timesheet creation)

**Out of scope (future work):**
- Invoice auto-generation on approval (endpoint structured to support this later)

## Impact

- **Affected specs**:
  - `persistence` (add blob storage)
  - `admin-dashboard` (modify duplicate handling)
- **New specs**:
  - `timesheet-management` (admin timesheets page)
  - `client-portal` (portal functionality)
- **Affected code**:
  - `src/lib/blob/` (new - blob storage client)
  - `src/app/api/timesheets/` (update for blob storage, duplicate handling)
  - `src/app/(admin)/timesheets/` (new page)
  - `src/app/portal/[token]/` (implement portal)
  - `src/app/api/portal/` (new - portal API routes)
  - `prisma/schema.prisma` (add portalToken to Client)
