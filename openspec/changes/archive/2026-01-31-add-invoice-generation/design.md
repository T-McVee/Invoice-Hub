# Design: Invoice Generation

## Context

When a client approves a timesheet in the portal, the system needs to automatically generate an invoice using the invoice-generator.com API. This involves:
1. Compiling data from timesheet, client, and business profile settings
2. Calling the external API to generate a PDF
3. Storing the PDF in Azure Blob Storage
4. Creating an invoice record in the database

## Goals / Non-Goals

**Goals:**
- Automatic invoice generation on timesheet approval
- PDF stored in blob storage and linked to invoice record
- Fail-open design: approval succeeds even if invoice generation fails
- Admin portal page to view and download invoices

**Non-Goals:**
- Manual invoice regeneration (future enhancement)
- Invoice editing or customization (invoices are immutable)
- Email delivery of invoices (separate future change)

## Decisions

### 1. Synchronous vs Asynchronous Generation

**Decision**: Synchronous (within the approval request)

**Rationale**:
- MVP-first: simpler implementation
- Invoice generation is fast (~2-3s for API + blob upload)
- User gets immediate feedback
- No job queue infrastructure needed

### 2. Error Handling Strategy

**Decision**: Fail-open with error reporting

**Rationale**:
- Timesheet approval is the critical path—should not fail due to invoice issues
- Return `invoiceError` field in response if generation fails
- Log errors for debugging
- Admin can manually trigger regeneration later (future enhancement)

### 3. Invoice Line Item Format

**Decision**: Single lump sum (quantity=1, unit_cost=total)

**Rationale**:
- Matches the user's example payload format
- Cleaner invoice appearance
- Total calculated as `hours × hourlyRate`

### 4. Invoice Number Format

**Decision**: Use timesheet ID directly (e.g., `1234`)

**Rationale**:
- Invoice number matches timesheet ID for easy cross-reference
- Simplifies implementation—no separate invoice number sequence needed
- Timesheet ID will be added prior to this work stream
- One-to-one relationship: each approved timesheet generates exactly one invoice

### 5. Module Structure

**Decision**: Create `src/lib/invoice-generator/` module

**Rationale**:
- Follows existing pattern (`src/lib/toggl/`, `src/lib/blob/`)
- Separates concerns: API client logic stays out of route handlers
- Makes invoice generator reusable for future manual regeneration

### 6. Invoice Schema: Include Month Field

**Decision**: Add `month` field to Invoice model (denormalized from Timesheet)

**Rationale**:
- Invoice is the primary record for historical billing queries
- Avoids joining through Timesheet just to filter by month
- Month is immutable, so denormalization has no sync risk
- Enables direct queries like "show me January 2026 invoices"
- Timesheet retains its `month` field (it's part of the unique constraint)

## Invoice Payload Structure

```json
{
  "from": "Business Name\nBusiness Number: XXX\nGST Number: XXX\nPhone\nEmail\nAddress",
  "to": "Client Name",
  "number": "1234",
  "date": "27 01 2026",
  "due_date": "11 02 2026",
  "items": [{ "name": "Web development services for January 2026", "quantity": 1, "unit_cost": 4000 }],
  "fields": { "tax": "%" },
  "tax": 5,
  "terms": "Please pay within 15 days",
  "notes_title": "Payment Details",
  "notes": "Payment instructions from business profile..."
}
```

## Data Flow

```
POST /api/portal/[token]/timesheets/[id]/approve
       ↓
1. Validate token & update timesheet status → 'approved'
       ↓
2. Fetch in parallel: client, businessProfile, hourlyRate
       ↓
3. Use timesheet ID as invoice number
       ↓
4. Compile invoice payload
       ↓
5. POST to invoice-generator.com → PDF buffer
       ↓
6. Upload PDF to Azure Blob Storage (invoices/{clientId}/{timesheetId}.pdf)
       ↓
7. Create Invoice record in database
       ↓
8. Return { timesheet, invoice, invoiceError? }
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| invoice-generator.com rate limits (100/month) | Acceptable for MVP; monitor usage |
| Invoice generation retry | If generation fails, admin can manually trigger later (future enhancement) |
| Added latency on approval (~2-3s) | Acceptable for MVP; can add loading indicator |
| Missing business profile data | Return descriptive error in `invoiceError` |

## Open Questions

None—all decisions resolved.
