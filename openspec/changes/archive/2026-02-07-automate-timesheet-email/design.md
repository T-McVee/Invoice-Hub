# Design: Automate Timesheet Email

## Schema Changes

Replace the single `isPrimary` field with two independent boolean fields on the `Contact` model in `schema.prisma`:

- `isPrimaryApprover: Boolean` (default: `false`)
- `isPrimaryBilling: Boolean` (default: `false`)

This allows a contact with role "both" to be primary in one scope without being primary in the other. For example, Bob (role: both) can be the primary approver while Alice (role: billing) is the primary billing contact.

### Constraints

- At most one contact per client can have `isPrimaryApprover=true`.
- At most one contact per client can have `isPrimaryBilling=true`.
- A single contact may hold both primary flags simultaneously.
- The primary flag must be relevant to the contact's role:
  - An `approver` contact can only have `isPrimaryApprover=true`.
  - A `billing` contact can only have `isPrimaryBilling=true`.
  - A `both` contact can have either or both.

## Recipient Logic

The system relies on `Contact` entities for all email notifications.

### Timesheet Notifications

1. Fetch all contacts for the client with role `approver` or `both`.
2. Find the **primary approver** (`isPrimaryApprover=true`). A primary approver is required.
3. **TO**: Primary approver's email.
4. **CC**: All other approver/both contacts.
5. **Greeting**: "Hi {PrimaryApprover.Name},"

### Invoice Notifications (Future)

Same pattern using `isPrimaryBilling` and contacts with role `billing` or `both`.

## Email Sending Behaviour

- **Blocking**: The API waits for the Resend response before returning to the client. This allows the UI to display email success/failure immediately.
- **Non-critical**: If email sending fails, the timesheet is still created successfully. The API response includes an `emailStatus` field (`sent` | `failed`).
- **Retry**: A dedicated `POST /api/timesheets/[id]/notify` endpoint allows re-sending the notification. The UI shows a retry button when `emailStatus` is `failed`.

## UI Enhancements

The `ClientEditDialog` will be refactored to unify recipient management under `Contacts`:

- **Remove** the separate lists for "Timesheet Recipients" and "Invoice Recipients".
- **Add** a "Contacts" section (list/table).
- **Fields per Contact**:
  - Name
  - Email
  - Role: Dropdown/Selection (`approver`, `billing`, `both`)
  - Primary Approver: Checkbox (only enabled when role is `approver` or `both`)
  - Primary Billing: Checkbox (only enabled when role is `billing` or `both`)
- **Validation**:
  - When setting `isPrimaryApprover` on a contact, automatically unset it on any other contact for that client.
  - When setting `isPrimaryBilling` on a contact, automatically unset it on any other contact for that client.
  - Disable irrelevant primary checkboxes based on role (e.g., hide/disable "Primary Approver" for a billing-only contact).
- **Migration**: Start fresh. Existing `timesheetRecipients`/`invoiceRecipients` strings are ignored. Contacts are entered manually via the new UI.

## Email Service

- **Service:** Resend
- **Env vars:** `RESEND_API_KEY`, `FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`
- **Link:** `{NEXT_PUBLIC_APP_URL}/portal/{token}`
