# Change: Automate invoice emailing on timesheet approval

## Why
When a client approves a timesheet, the system generates an invoice but doesn't send it. The invoice sits as a `draft` with no delivery mechanism. The admin must manually download and email the invoice, defeating the purpose of the automated workflow. Step 5 of the core workflow ("Invoice Delivery: Email the invoice to the designated contact") is unimplemented.

## What Changes
- Add an invoice email template that sends the invoice PDF as an attachment to billing contacts
- Automatically send the invoice email after successful invoice generation on timesheet approval
- Add a manual "Send Invoice" action in the admin invoices page for retry/resend
- Update invoice status from `draft` to `sent` when email succeeds
- Follow the same fail-open pattern used for invoice generation: if email fails, approval still succeeds

## Impact
- Affected specs: `email-notification`, `invoice-generation`
- Affected code:
  - `src/lib/email/templates/` (new invoice template)
  - `src/app/api/portal/[token]/timesheets/[id]/approve/route.ts` (trigger email after invoice generation)
  - `src/app/api/invoices/` (new send endpoint)
  - `src/app/(admin)/invoices/` (send button in UI)
