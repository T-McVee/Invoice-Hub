# Change: Add Client Billing Address to Invoices

## Why

Generated invoices currently only show the client's name in the "to" field. Professional invoices should include the client's full billing address for proper record-keeping and legal compliance.

## What Changes

- Add a `billingAddress` field to the Client model in the database schema
- Update the client management UI to allow editing the billing address
- Include the billing address in the invoice "to" field when generating invoices via invoice-generator.com

## Impact

- Affected specs: `client-management`, `invoice-generation`
- Affected code:
  - `prisma/schema.prisma` - Add `billingAddress` field to Client model
  - `src/types/index.ts` - Update Client interface
  - `src/app/(admin)/clients/components/client-edit-dialog.tsx` - Add billing address textarea
  - `src/lib/invoice-generator/index.ts` - Include billing address in "to" field
