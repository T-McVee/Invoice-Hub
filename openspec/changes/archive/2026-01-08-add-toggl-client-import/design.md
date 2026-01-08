# Design: Add Toggl Client Import with Enhanced Metadata

## Context

Invoice Hub needs to manage clients that exist in Toggl Track. Currently clients are hardcoded in mock data. The Toggl API provides client data that we can import, but we also need to store additional metadata (recipient emails) that Toggl doesn't support.

## Goals / Non-Goals

**Goals:**

- Fetch and display clients from the Toggl Track API
- Allow importing Toggl clients into the app
- Store additional metadata per client (timesheet/invoice recipients)
- Provide CRUD operations for client management

**Non-Goals:**

- Two-way sync with Toggl (we only import from Toggl, not push back)
- Managing Toggl client data (creating/editing clients in Toggl)
- Automatic client synchronization (manual import only for MVP)
- Toggl project selection/linking (separate concern, manual config for now)
- Azure SQL Database migration (MVP uses mock store, migrate later)

## Decisions

### 1. Client ID Strategy

**Decision:** Keep separate `togglClientId` and `togglProjectId` fields.

**Rationale:** In Toggl, clients and projects are distinct entities. A client can have multiple projects. We need both:

- `togglClientId` - Links to the Toggl client entity (for importing client name/details)
- `togglProjectId` - Links to the Toggl project (for fetching time entries and generating timesheets)

### 2. Recipient Email Storage

**Decision:** Store as arrays of email strings directly on the Client entity.

**Alternatives considered:**

- Extend Contact entity → More complex, but provides name/role per recipient
- Store in notes field (JSON) → Hacky, poor DX
- Separate EmailRecipient entity → Over-engineered for MVP

**Rationale:** Simple arrays are sufficient for MVP. Recipients are just email addresses for sending timesheets/invoices. Can evolve to full Contact entities later if needed.

### 3. Data Model Extension

```typescript
interface Client {
  id: string;
  name: string;
  togglClientId: string | null; // NEW: Toggl client ID
  togglProjectId: string; // Existing: Toggl project for time entries
  timesheetRecipients: string[]; // NEW: Emails for timesheet notifications
  invoiceRecipients: string[]; // NEW: Emails for invoice notifications
  notes: string | null; // NEW: Optional notes
  contacts: Contact[]; // Existing: Legacy contacts (keep for compatibility)
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Toggl API Response Mapping

Toggl API v9 response for clients:

```json
{
  "id": 12345,
  "wid": 67890,
  "name": "Client Name",
  "at": "2024-01-15T10:30:00+00:00",
  "archived": false,
  "notes": "Client notes"
}
```

Maps to our Client as:

- `togglClientId` ← `id`
- `name` ← `name` (can be overridden locally)
- `notes` ← `notes` (merged with local notes)

## Risks / Trade-offs

**Risk:** Client name drift between Toggl and our app  
**Mitigation:** Name is editable locally. Consider adding "refresh from Toggl" feature later.

**Risk:** Toggl API rate limits (introduced Sept 2025)  
**Mitigation:** Client list is small, single fetch on demand. Cache results if needed.

## Persistence Strategy

**Decision:** Use Azure SQL Database for client data persistence.

**Rationale:**

- Client data is structured and relational (links to timesheets, invoices)
- Requires CRUD operations and querying
- Aligns with existing tech stack in `project.md`
- Azure Blob Storage remains for PDF files only

**MVP Approach:** Continue using in-memory mock data store for initial implementation, then migrate to Azure SQL when ready for production. The data access layer (`src/lib/db/`) abstracts storage, making migration straightforward.

**Schema (for future Azure SQL migration):**

```sql
CREATE TABLE clients (
  id NVARCHAR(36) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  toggl_client_id NVARCHAR(50) NULL,
  toggl_project_id NVARCHAR(50) NULL,
  timesheet_recipients NVARCHAR(MAX) NULL,  -- JSON array of emails
  invoice_recipients NVARCHAR(MAX) NULL,    -- JSON array of emails
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

## Open Questions

- None currently - project selection deferred to future work when multiple projects per client are needed
