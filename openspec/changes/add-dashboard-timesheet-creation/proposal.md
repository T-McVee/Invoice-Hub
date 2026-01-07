# Change: Add Dashboard Timesheet Creation

## Why

The admin portal needs a way to manually create timesheets for a given month and client. This is a core admin workflow that enables on-demand timesheet generation outside the automated monthly cycle.

## What Changes

- Add a "Create Timesheet" form/control to the dashboard page
- Implement month selector (year + month picker)
- Implement client selector (dropdown with available clients)
- Create API endpoint to initiate timesheet creation
- Integrate with Toggl API to fetch time entries and PDF for selected month/client
- Store timesheet record in database with status tracking
- Display creation result/feedback on dashboard

## Impact

- Affected specs: `admin-dashboard` (new capability)
- Affected code:
  - `src/app/(admin)/dashboard/page.tsx` - Add creation controls
  - `src/app/(admin)/dashboard/components/` - New form components
  - `src/app/api/timesheets/` - New API route for timesheet creation
  - `src/lib/toggl/` - Toggl API client implementation
  - Database schema (new timesheets table)
