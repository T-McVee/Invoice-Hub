# Tasks: Add Client Billing Address to Invoices

## 1. Database Schema
- [x] 1.1 Add `billingAddress` optional String field to Client model in Prisma schema
- [x] 1.2 Create and apply database migration

## 2. Type Definitions
- [x] 2.1 Update Client interface in `src/types/index.ts` to include `billingAddress`

## 3. Client Management UI
- [x] 3.1 Add billing address textarea field to `client-edit-dialog.tsx`
- [x] 3.2 Include `billingAddress` in form state and PATCH request

## 4. Invoice Generation
- [x] 4.1 Create `buildToField()` helper in `src/lib/invoice-generator/index.ts` that formats client name on first line, billing address on subsequent lines (newline-separated)
- [x] 4.2 Update invoice payload construction to use `buildToField()` for the "to" field

## 5. Testing
- [x] 5.1 Add/update tests for client update with billing address
- [x] 5.2 Add/update tests for invoice payload construction with billing address
