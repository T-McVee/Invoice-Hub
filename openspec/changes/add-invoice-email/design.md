## Context
The system already has a working email infrastructure (Resend), contact management with billing roles, and an invoice generation flow triggered on timesheet approval. This change wires them together to complete the automated workflow.

## Goals / Non-Goals
- Goals:
  - Automatically email invoices to billing contacts when a timesheet is approved
  - Provide manual send/resend for admin
  - Follow existing patterns (timesheet notification is the template)
- Non-Goals:
  - Email tracking/read receipts
  - Scheduled/delayed sending
  - Custom email templates per client

## Decisions
- **PDF delivery**: Attach the invoice PDF directly to the email (download from blob storage). Rationale: billing contacts expect a PDF they can file/forward; a portal link adds friction and requires auth.
- **Recipient logic**: Mirror timesheet notification pattern — `isPrimaryBilling` contact gets TO, other `billing`/`both` contacts get CC. Consistent with existing contact model.
- **Fail-open pattern**: If invoice email fails, approval still succeeds and invoice stays as `draft`. Admin can retry via the invoices page. Consistent with how invoice generation failures are handled.
- **Status transitions**: Invoice starts as `draft` (created on approval). Moves to `sent` when email succeeds. `sentAt` timestamp recorded. Manual resend updates `sentAt`.

## Risks / Trade-offs
- Resend free tier is 100 emails/day — sufficient for current scale (1 client), but worth monitoring if scaling up.
- PDF attachment size: invoice PDFs are typically small (<100KB), well within Resend's 40MB attachment limit.

## Open Questions
- None
