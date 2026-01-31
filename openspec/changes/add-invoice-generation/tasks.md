# Tasks: Add Invoice Generation

## 0. Schema Updates

- [x] 0.1 Add `month` field to Invoice model in Prisma schema
- [x] 0.2 Migrate `paymentTerms` from string to `paymentTermsDays` number in business profile
  - Update `src/lib/settings/schemas.ts`
  - Update `src/lib/settings/index.ts` (type + implementation)
  - Update `src/lib/settings/index.test.ts`
  - Update `src/app/(admin)/settings/page.tsx` (text → number input)
  - Update `src/app/api/settings/business-profile/route.ts`
  - Update `src/app/api/settings/business-profile/route.test.ts`
- [ ] 0.3 Run migrations to apply schema changes

## 1. Invoice Generator Module

- [x] 1.1 Create `src/lib/invoice-generator/client.ts` - API client for invoice-generator.com
- [x] 1.2 Create `src/lib/invoice-generator/index.ts` - Service module with helper functions
- [x] 1.3 Write tests for invoice generator module

## 2. Blob Storage

- [x] 2.1 Add `getInvoiceBlobPath()` helper to `src/lib/blob/client.ts`
- [x] 2.2 Write test for `getInvoiceBlobPath()`

## 3. Approval Route Integration

- [ ] 3.1 Update approval route to trigger invoice generation after status update
- [ ] 3.2 Update approval route tests for invoice generation scenarios

## 4. Admin Portal Invoices Page

- [ ] 4.1 Add `listInvoices()` to invoice repository with client/status filters
- [ ] 4.2 Create `/api/invoices` route to fetch invoices
- [ ] 4.3 Create `src/app/(admin)/invoices/page.tsx` with table view
  - Columns: Invoice #, Client, Month, Amount, Status, Created
  - Link to download PDF from blob storage
- [ ] 4.4 Add invoices link to admin navigation

## 5. Verification

- [ ] 5.1 Manual end-to-end test: approve timesheet → verify invoice created
