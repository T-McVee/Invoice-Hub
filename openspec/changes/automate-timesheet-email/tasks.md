# Tasks: Automate Timesheet Email Notification

## 1. Database & Persistence

- [x] 1.1 Update Prisma schema: Add `isPrimaryApprover` and `isPrimaryBilling` to `Contact` model
- [x] 1.2 Create and apply database migration

## 2. Client Management UI

- [x] 2.1 Update `ClientEditDialog` to manage `Contacts` (Name, Email, Role, Primary Approver, Primary Billing) replacing legacy recipient lists
- [x] 2.2 Add front-end validation: require primary per role scope (block save if approver/both contacts exist without a Primary Approver, same for billing), enable/disable primary checkboxes based on contact role

## 3. Email Infrastructure

- [x] 3.1 Install `resend` and add `RESEND_API_KEY`, `FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` to `.env.example`
- [x] 3.2 Create `src/lib/email/client.ts` to initialize Resend and define sending logic
- [x] 3.3 Create `src/lib/email/templates/timesheet-ready.ts` for the email content

## 4. API & Integration

- [x] 4.1 Update `src/app/api/timesheets/route.ts`: fetch recipients (primary approver → TO, others → CC), send email, return `emailStatus` in response
- [x] 4.2 Create `POST /api/timesheets/[id]/notify` retry endpoint

## 5. UI Updates

- [x] 5.1 Update timesheet creation UI to display email status (sent/failed) with retry button

## 6. Testing

- [x] 6.1 Test recipient logic (primary TO + CC, validation that primary is required)
- [x] 6.2 Test timesheet creation with email success and failure scenarios
