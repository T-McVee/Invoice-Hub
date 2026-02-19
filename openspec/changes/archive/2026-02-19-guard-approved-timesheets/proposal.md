# Change: Guard approved timesheets from deletion and regeneration

## Why
Approved timesheets are tied to generated invoices via invoice numbers. Allowing force-regeneration of approved timesheets silently deletes associated invoices and PDFs, breaking invoice integrity and audit trails.

## What Changes
- Block force-regeneration (`POST /api/timesheets` with `force=true`) when the existing timesheet has status `approved`
- Return a clear error explaining the constraint and suggesting the user revoke/delete the associated invoice first
- No standalone DELETE route exists today, so no additional route needs guarding

## Impact
- Affected specs: `timesheet-management`
- Affected code: `src/app/api/timesheets/route.ts` (POST handler, force-regeneration branch)
