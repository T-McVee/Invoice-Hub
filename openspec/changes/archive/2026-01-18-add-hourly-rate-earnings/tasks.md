# Tasks: Add Global Hourly Rate with Estimated Earnings

## 1. Dependencies

- [x] 1.1 Install Zod (`npm install zod`)

## 2. Settings Infrastructure

- [x] 2.1 Create `src/lib/settings/index.ts` with in-memory settings store
- [x] 2.2 Implement `getHourlyRate()` and `setHourlyRate()` functions
- [x] 2.3 Add default hourly rate value (null when not configured)

## 3. Settings API

- [x] 3.1 Create `src/app/api/settings/hourly-rate/route.ts`
- [x] 3.2 Create Zod schema for hourly rate validation (number ≥ 0)
- [x] 3.3 Implement GET handler to retrieve current hourly rate
- [x] 3.4 Implement PUT handler with Zod validation

## 4. Settings Page

- [x] 4.1 Create `src/app/(admin)/settings/page.tsx`
- [x] 4.2 Add hourly rate input field with save functionality
- [x] 4.3 Display current rate value and last updated timestamp
- [x] 4.4 Use Zod schema for client-side validation feedback
- [x] 4.5 Add "Settings" link to navigation menu

## 5. Earnings MTD Endpoint

- [x] 5.1 Create `src/app/api/metrics/earnings-mtd/route.ts`
- [x] 5.2 Fetch hours from existing hours-mtd cache/logic
- [x] 5.3 Calculate earnings as `hours * hourlyRate` (null if rate not set)
- [x] 5.4 Return earnings, hourlyRate, hours, and month in response

## 6. Earnings Card Component

- [x] 6.1 Create `src/app/(admin)/dashboard/components/earnings-this-month-card.tsx`
- [x] 6.2 Display estimated earnings with currency formatting
- [x] 6.3 Handle unconfigured state (prompt with link to Settings page)
- [x] 6.4 Show loading/error states

## 7. Dashboard Integration

- [x] 7.1 Export new component from `components/index.ts`
- [x] 7.2 Add `EarningsThisMonthCard` to dashboard grid in `page.tsx`

## 8. Validation

- [x] 8.1 Verify earnings calculation accuracy
- [x] 8.2 Test rate persistence across page refreshes
- [x] 8.3 Confirm graceful handling when rate is not set
- [x] 8.4 Verify Settings page navigation works correctly
