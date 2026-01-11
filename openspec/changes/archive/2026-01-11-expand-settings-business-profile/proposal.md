# Change: Expand Settings with Business Profile

## Why

The application needs to collect and persist business/user profile information that will be used for invoice generation. Currently, settings only store the hourly rate, but invoices require sender details like name, business number, contact information, address, payment details, and terms.

## What Changes

- Add a new "Business Profile" section to the Settings page
- Add fields for:
  - User's name (business/personal name for invoices)
  - Business number (ABN, registration number, etc.)
  - GST number (tax registration number)
  - Phone number
  - Email address
  - Address (multiline)
  - Payment details (multiline, e.g., bank account details)
  - Tax rate (percentage)
  - Payment terms (text, e.g., "Net 30", "Due within 14 days")
  - Next invoice number (auto-increments after invoice creation, user-overridable)
- Extend the settings storage to persist all new fields
- Extend the settings API to handle the new fields

## Impact

- Affected specs: `admin-settings`
- Affected code:
  - `src/lib/settings/index.ts` - Add new fields to settings store
  - `src/app/api/settings/` - New or updated API routes for business profile
  - `src/app/(admin)/settings/page.tsx` - Add form fields for business profile
