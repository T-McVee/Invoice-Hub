# Tasks: Secure PDF Access

## 1. Implementation

- [x] 1.1 Create authenticated PDF endpoint at `src/app/api/portal/[token]/timesheets/[id]/pdf/route.ts`
  - Validate JWT token using `verifyPortalToken()`
  - Fetch timesheet by ID
  - Verify `timesheet.clientId === payload.clientId` (ownership check)
  - Stream PDF from blob storage on success
  - Return 401/403 for auth failures

- [x] 1.2 Update portal UI to use authenticated endpoint
  - Change PDF link in `src/app/portal/[token]/page.tsx` from `/api/timesheets/${id}/pdf` to `/api/portal/${token}/timesheets/${id}/pdf`

## 2. Testing

- [x] 2.1 Write tests for authenticated PDF endpoint
  - Valid token + owned timesheet → 200 with PDF
  - Valid token + unowned timesheet → 403 Forbidden
  - Invalid/expired token → 401 Unauthorized
  - Non-existent timesheet → 404 Not Found

## 3. Validation

- [ ] 3.1 Manual verification
  - Access PDF via client portal with valid token works
  - Attempting to access another client's PDF via portal fails with 403
  - Admin portal PDF access continues to work (legacy endpoint)
