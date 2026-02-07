# Automate Timesheet Email Notification

## Context

Currently, timesheets are created via the API, but no notification is sent to the client. The system primarily uses `timesheetRecipients` (a simple list of emails) which lacks the name data required for personalized greetings. A `Contact` entity exists but is underutilized and lacks a way to designate a primary contact for addressing emails.

## Goal

Automate the process of notifying clients when a new timesheet is ready, ensuring emails are personalized and addressed to the correct primary contact.

## Changes

1.  **Data Model**: Update `Contact` entity to include `isPrimaryApprover` and `isPrimaryBilling` (booleans), enabling independent primary designation per role scope.
2.  **UI**: Update the Client Management UI to allow full management of `Contact` entities (Name, Email, Role, Primary Approver, Primary Billing) replacing the simple "Timesheet Recipients" list.
3.  **Email Infrastructure**: Integrate `Resend` for sending emails.
4.  **Notification Logic**: Trigger an email notification upon successful timesheet creation. Email sending is blocking (API waits for result) but non-critical — the timesheet is still created if the email fails. The UI displays email status with a retry button on failure.
5.  **Email Content**: Send a personalized email.
    - **Subject**: "{month} timesheet"
    - **To**: Primary approver contact.
    - **CC**: Non-primary approver/both contacts.
    - **Greeting**: "Hi {PrimaryContact.Name},"
    - **Body**: "Please find my {month} timesheet is ready for review and approval in your portal: {Link} \n\nThanks again, Tim."
6.  **Retry Endpoint**: `POST /api/timesheets/[id]/notify` to re-send failed email notifications.

## Out of Scope

- Tracking email open rates.
- Auto-migration of legacy `timesheetRecipients`/`invoiceRecipients` data (manual re-entry is acceptable).
