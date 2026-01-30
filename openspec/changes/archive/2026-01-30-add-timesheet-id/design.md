# Design: Timesheet ID Numbers

## Context

Each timesheet needs a sequential ID number that will become the invoice number when the timesheet is approved. The existing `nextInvoiceNumber` setting in the business profile already tracks this sequence.

## Goals / Non-Goals

**Goals:**
- Assign sequential ID to each timesheet on creation
- Use existing `nextInvoiceNumber` from settings
- Display ID in admin and portal views
- Provide ID for invoice generation to use directly

**Non-Goals:**
- Changing invoice number format (stays as plain integer)
- Making timesheet IDs editable after creation
- Separate numbering for timesheets vs invoices (they're the same)

## Decisions

### 1. Field Naming

**Decision**: Name the field `invoiceNumber` (not `timesheetNumber` or `id`)

**Rationale**:
- This number becomes the invoice number—naming it `invoiceNumber` makes the relationship clear
- Avoids confusion with the UUID `id` field
- Consistent with the Invoice model which already has `invoiceNumber`

### 2. Number Assignment Timing

**Decision**: Assign on timesheet creation, not on approval

**Rationale**:
- Numbers are assigned immediately when the timesheet is created
- Provides a stable reference before approval
- Avoids gaps in the sequence if a timesheet is created but never approved
- Users can see the invoice number as soon as the timesheet exists

### 3. Number Source

**Decision**: Use existing `nextInvoiceNumber` from business profile settings

**Rationale**:
- Already implemented with atomic increment (`getAndIncrementNextInvoiceNumber()`)
- User can configure the starting number in Settings
- Single source of truth for the numbering sequence

### 4. Database Field Type

**Decision**: `Int` (not String)

**Rationale**:
- Numbers are stored as integers for efficient sorting and comparison
- Displayed as plain integers (no prefix, no padding)
- Invoice model stores `invoiceNumber` as String for flexibility, but timesheet can use Int since no prefix needed

### 5. Handling Force Recreate

**Decision**: Reuse the same invoice number when recreating a timesheet with `force=true`

**Rationale**:
- When a timesheet is deleted and recreated for the same client/month, it should keep the same number
- Prevents gaps in the sequence and maintains document consistency
- The existing timesheet's `invoiceNumber` is preserved and reused

## Data Flow

```
POST /api/timesheets (create timesheet)
       ↓
1. Check for existing timesheet (client + month)
   - If exists and force=false: return 409 conflict
   - If exists and force=true: capture existing invoiceNumber, delete existing
       ↓
2. Get invoice number:
   - If force recreate: reuse captured invoiceNumber
   - Otherwise: getAndIncrementNextInvoiceNumber() from settings
       ↓
3. Create timesheet record with invoiceNumber
       ↓
4. Return timesheet (includes invoiceNumber)
```

## Migration Strategy

Existing timesheets (if any) will have `invoiceNumber` set to `null` after migration. These are legacy records created before the feature. The field is nullable to support this.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing timesheets lack invoice number | Field is nullable; only new timesheets get numbers |
| Number gaps if timesheet deleted | Acceptable trade-off; gaps don't affect functionality |
| Race condition on number assignment | Atomic transaction in `getAndIncrementNextInvoiceNumber()` |
