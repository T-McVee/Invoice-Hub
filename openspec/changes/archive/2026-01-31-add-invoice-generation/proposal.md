# Change: Add Invoice Generation on Timesheet Approval

## Why

The core workflow requires invoices to be generated automatically when a client approves their timesheet. Currently, timesheet approval only updates the status—no invoice is created. This blocks the end-to-end invoicing workflow.

## What Changes

- **New capability**: `invoice-generation` - API client for invoice-generator.com and payload compilation logic
- **Modified capability**: `client-portal` - Trigger invoice generation after timesheet approval
- **Modified capability**: `persistence` - Add invoice PDF blob storage path helper

## Impact

- Affected specs: `invoice-generation` (new), `client-portal`, `persistence`
- Affected code:
  - `src/lib/invoice-generator/` (new module)
  - `src/app/api/portal/[token]/timesheets/[id]/approve/route.ts`
  - `src/lib/blob/client.ts`
- External dependency: invoice-generator.com API (100 invoices/month free tier)
