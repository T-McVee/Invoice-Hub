## 1. Backend - Settings Store

- [x] 1.1 Add `BusinessProfile` type definition to `src/lib/settings/index.ts` with fields: name, businessNumber, gstNumber, phone, email, address, paymentDetails, taxRate, paymentTerms, nextInvoiceNumber, updatedAt
- [x] 1.2 Add Zod schemas for business profile validation (email format, tax rate 0-100, nextInvoiceNumber positive integer)
- [x] 1.3 Add in-memory storage and getter/setter functions for business profile
- [x] 1.4 Add `incrementNextInvoiceNumber()` function that returns the current number and increments for next use

## 2. Backend - API Routes

- [x] 2.1 Create `GET /api/settings/business-profile` endpoint to retrieve business profile
- [x] 2.2 Create `PUT /api/settings/business-profile` endpoint to update business profile with validation

## 3. Frontend - Settings Page

- [x] 3.1 Add Business Profile section UI with card layout matching the Hourly Rate section
- [x] 3.2 Add form fields: name, businessNumber, gstNumber, phone, email (single-line inputs)
- [x] 3.3 Add form fields: address, paymentDetails (multiline textareas)
- [x] 3.4 Add form fields: taxRate (number input with % suffix), paymentTerms (text input)
- [x] 3.5 Implement TanStack Query hooks for fetching and updating business profile
- [x] 3.6 Add client-side validation with error messages
- [x] 3.7 Display last updated timestamp when profile has been saved

## 4. Validation

- [x] 4.1 Manually test all fields save and persist correctly
- [x] 4.2 Verify validation errors display for invalid email, tax rate, and next invoice number
- [x] 4.3 Verify UI matches existing settings page styling
