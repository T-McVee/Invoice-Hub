# Tasks: Add Invoice Generation

## 1. Invoice Generator Module

- [ ] 1.1 Create `src/lib/invoice-generator/client.ts` - API client for invoice-generator.com
- [ ] 1.2 Create `src/lib/invoice-generator/index.ts` - Service module with helper functions
- [ ] 1.3 Write tests for invoice generator module

## 2. Blob Storage

- [ ] 2.1 Add `getInvoiceBlobPath()` helper to `src/lib/blob/client.ts`
- [ ] 2.2 Write test for `getInvoiceBlobPath()`

## 3. Approval Route Integration

- [ ] 3.1 Update approval route to trigger invoice generation after status update
- [ ] 3.2 Update approval route tests for invoice generation scenarios

## 4. Verification

- [ ] 4.1 Manual end-to-end test: approve timesheet → verify invoice created
