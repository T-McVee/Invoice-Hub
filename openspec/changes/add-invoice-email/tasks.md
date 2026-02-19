## 1. Email Template & Sending Logic
- [ ] 1.1 Create invoice email template (`src/lib/email/templates/invoice-ready.ts`)
- [ ] 1.2 Create invoice send helper with billing contact filtering (`src/lib/email/send-invoice.ts`)
- [ ] 1.3 Write tests for invoice email template and send helper

## 2. Auto-Send on Approval
- [ ] 2.1 Integrate invoice email sending into the approval flow (after invoice generation)
- [ ] 2.2 Update invoice status to `sent` and set `sentAt` on successful email
- [ ] 2.3 Write tests for the updated approval flow

## 3. Admin Manual Send
- [ ] 3.1 Create `POST /api/invoices/[id]/send` endpoint for manual sending
- [ ] 3.2 Add "Send Invoice" / "Resend" button to admin invoices page
- [ ] 3.3 Write tests for the send endpoint
