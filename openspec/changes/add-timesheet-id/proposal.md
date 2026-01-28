# Change: Add Timesheet ID Numbers

## Why

The invoice generation feature requires timesheets to have a sequential ID number that becomes the invoice number. Currently timesheets only have a UUID for database relationships but no user-facing sequential identifier.

## What Changes

- **Modified capability**: `persistence` - Add `invoiceNumber` field to Timesheet model, assign on creation
- **Modified capability**: `timesheet-management` - Display invoice number in admin timesheet list, details, and dashboard
- **Modified capability**: `client-portal` - Display invoice number in portal timesheet cards

## Impact

- Affected specs: `persistence`, `timesheet-management`, `client-portal`
- Affected code:
  - `prisma/schema.prisma` - Add `invoiceNumber` field to Timesheet
  - `src/types/index.ts` - Add `invoiceNumber` to Timesheet type
  - `src/lib/db/repositories/timesheet.ts` - Include `invoiceNumber` in transforms and create
  - `src/app/api/timesheets/route.ts` - Get and assign invoice number on creation
  - `src/app/(admin)/timesheets/page.tsx` - Display invoice number in list
  - `src/app/(admin)/dashboard/page.tsx` - Display invoice number in recent activity
  - `src/app/portal/[token]/page.tsx` - Display invoice number in timesheet cards
- Dependency: Blocks invoice generation (add-invoice-generation OpenSpec)
