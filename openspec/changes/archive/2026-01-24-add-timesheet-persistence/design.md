## Context

The timesheet creation feature exists but saves PDFs to `/tmp`, which is ephemeral. This change adds durable storage and completes the approval workflow.

**Stakeholders**: Admin (views/manages timesheets), Clients (approve timesheets via portal)

**Constraints**:
- Azure ecosystem (Blob Storage for PDFs)
- MVP-first: minimal complexity
- Per-client portal tokens (not per-timesheet)

## Goals / Non-Goals

**Goals:**
- Persist timesheet PDFs to Azure Blob Storage with database references
- Admin can view all timesheets and their approval status
- Clients can view their timesheets and approve pending ones
- Invoice auto-generates upon approval

**Non-Goals:**
- Email notifications (separate change)
- Timesheet rejection with comments
- Invoice customization/editing
- Multi-tenant support

## Decisions

### 1. Blob Storage Structure
- **Decision**: Store PDFs at `timesheets/{clientId}/{month}.pdf`
- **Rationale**: Simple, predictable paths; easy to locate by client/month

### 2. Portal Token Strategy
- **Decision**: JWT-based portal tokens with ~45 day expiry
- **Rationale**: Time-limited exposure if token leaks; self-contained expiry validation; natural fit for future email workflow
- **Implementation**:
  - JWT payload: `{ clientId, iat, exp }` signed with app secret
  - Generated when timesheet is created for a client
  - Stored in `portalToken` field on Client model
  - Expiry decoded from JWT on each request (no separate column)
  - Admin manually shares link until email integration is added
- **Expired token handling**: Show "Link expired - please contact admin" page
- **Future enhancement**: Add "Request new link" button that emails fresh JWT when Resend is integrated

### 3. Duplicate Timesheet Handling
- **Decision**: Return existing timesheet info with `exists: true` flag; frontend prompts user; if confirmed, delete old and create new
- **Rationale**: Preserves user intent, allows regeneration with fresh Toggl data
- **Implementation**:
  - GET check before POST, or
  - POST returns 200 with `exists: true` instead of 409, frontend handles

### 4. Invoice Generation (Descoped)
- **Decision**: Invoice generation is OUT OF SCOPE for this change
- **Rationale**: Requires further design (Invoice Generator API integration, invoice numbering, amount calculation from hourly rate)
- **Preparation**: The approval endpoint will be structured to easily add invoice generation later:
  - Approval updates status and returns success
  - Future: add `generateInvoice(timesheetId)` call after status update
  - Invoice model and blob storage patterns established by this change

### 5. API Architecture
- **Decision**: All operations (timesheet creation, approval) live in Next.js API routes
- **Rationale**: MVP simplicity; single deployment; operations are fast enough; Azure App Service has generous timeouts
- **Future consideration**: Scheduled "monthly pull" automation could move to Azure Function with timer trigger

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Blob storage connection issues | Graceful error handling; timesheet creation fails cleanly |
| Invoice API failure on approval | Mark timesheet approved anyway; log error; admin can retry |
| Portal token leaked | Can regenerate token; only exposes that client's data |

## Migration Plan

1. Add `portalToken` column to Client (nullable initially)
2. Generate tokens for existing clients via migration or on-demand
3. Deploy blob storage integration
4. No breaking changes to existing data

## Open Questions

None - all clarified with user.
