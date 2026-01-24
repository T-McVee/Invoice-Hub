## 1. Azure Blob Storage Integration
- [x] 1.1 Add `@azure/storage-blob` dependency
- [x] 1.2 Create `src/lib/blob/client.ts` with upload/download/delete functions
- [x] 1.3 Add blob storage environment variables (`AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER`)
- [x] 1.4 Write tests for blob client (mock Azure SDK)

## 2. Database Schema & JWT Setup
- [x] 2.1 Add `portalToken` field to Client model (String, optional - stores JWT)
- [x] 2.2 Add `JWT_SECRET` environment variable for signing
- [x] 2.3 Create `src/lib/auth/jwt.ts` with sign/verify/decode functions
- [x] 2.4 Create migration
- [x] 2.5 Write tests for JWT utilities

## 3. Timesheet Creation Updates
- [x] 3.1 Update `POST /api/timesheets` to upload PDF to blob storage
- [x] 3.2 Store blob URL in `pdfUrl` field instead of local path
- [x] 3.3 Generate/refresh client's portal JWT on successful timesheet creation
- [x] 3.4 Add duplicate check endpoint `GET /api/timesheets/check?clientId=X&month=Y`
- [x] 3.5 Add `force` parameter to `POST /api/timesheets` to replace existing
- [x] 3.6 Update `CreateTimesheetForm` to check for existing and show confirmation dialog
- [x] 3.7 Update existing tests, add tests for new behavior

## 4. Admin Timesheets Page
- [x] 4.1 Create `src/app/(admin)/timesheets/page.tsx` with timesheet list
- [x] 4.2 Add columns: Client, Month, Status, Total Hours, Created, Actions
- [x] 4.3 Add status badge component (pending/sent/approved/rejected)
- [x] 4.4 Add "View PDF" action (opens blob URL)
- [x] 4.5 Add navigation link to sidebar
- [x] 4.6 Create `timesheets.queries.ts` for React Query hooks

## 5. Client Portal Implementation
- [x] 5.1 Create `GET /api/portal/[token]` with JWT validation, return client data and timesheets
- [x] 5.2 Create `POST /api/portal/[token]/timesheets/[id]/approve` endpoint
- [x] 5.3 Update `src/app/portal/[token]/page.tsx` with timesheet list UI
- [x] 5.4 Add approval button for pending timesheets
- [x] 5.5 Show approved timesheets in "History" section
- [x] 5.6 Add PDF download links
- [x] 5.7 Create expired token page with "contact admin" message
- [x] 5.8 Write tests for portal API routes (valid token, expired token, invalid token)

## 6. Admin Client Portal Link Management
- [x] 6.1 Add portal link display to client detail view (or clients list)
- [x] 6.2 Add "Copy Portal Link" button
- [x] 6.3 Add "Regenerate Portal Link" button with confirmation
- [x] 6.4 Create `POST /api/clients/[id]/regenerate-token` endpoint

## 7. Validation & Cleanup
- [x] 7.1 Run full test suite, fix any failures
- [x] 7.2 Manual end-to-end test of full workflow
- [x] 7.3 Update CLAUDE.md if new environment variables added
