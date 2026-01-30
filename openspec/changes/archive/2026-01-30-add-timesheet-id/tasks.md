# Tasks: Add Timesheet ID Numbers

## 1. Database Schema

- [ ] 1.1 Add `invoiceNumber Int?` field to Timesheet model in `prisma/schema.prisma`
- [ ] 1.2 Create and apply Prisma migration

## 2. TypeScript Types

- [ ] 2.1 Add `invoiceNumber: number | null` to Timesheet interface in `src/types/index.ts`

## 3. Repository Layer

- [ ] 3.1 Update `toTimesheet()` transform to include `invoiceNumber` in `src/lib/db/repositories/timesheet.ts`
- [ ] 3.2 Update `createTimesheet()` to accept and persist `invoiceNumber`
- [ ] 3.3 Write tests for timesheet repository invoice number handling

## 4. API Route

- [ ] 4.1 Update POST `/api/timesheets` to:
  - Get invoice number from settings (or reuse existing on force recreate)
  - Pass invoice number to `createTimesheet()`
- [ ] 4.2 Write tests for timesheet creation with invoice number assignment

## 5. Admin UI

- [ ] 5.1 Add invoice number column to timesheets table in `src/app/(admin)/timesheets/page.tsx`
- [ ] 5.2 Display invoice number in dashboard recent activity (`src/app/(admin)/dashboard/page.tsx`)

## 6. Client Portal UI

- [ ] 6.1 Display invoice number in portal timesheet cards (`src/app/portal/[token]/page.tsx`)

## 7. Verification

- [ ] 7.1 Manual test: create timesheet → verify invoice number assigned
- [ ] 7.2 Manual test: force recreate timesheet → verify same invoice number preserved
- [ ] 7.3 Manual test: verify invoice number displays in admin timesheets list
- [ ] 7.4 Manual test: verify invoice number displays in admin dashboard
- [ ] 7.5 Manual test: verify invoice number displays in client portal
