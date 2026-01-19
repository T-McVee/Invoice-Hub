# Change: Add Live Dashboard Metrics with Caching

## Why

The dashboard currently displays hardcoded dummy values for key metrics (hours this month, pending invoices, etc.). Replacing these with real data from Toggl Track will make the dashboard useful for actual work tracking and business insight.

## What Changes

- Add a server-side caching layer to avoid hitting Toggl API rate limits
- Create new Toggl client function to fetch all time entries for the current month (across all projects)
- Add API endpoint `/api/metrics/hours-mtd` to return month-to-date hours
- Update the dashboard "Hours This Month" card to fetch and display real data
- Show loading and error states, with stale data fallback when API is unavailable

## Impact

- Affected specs: `dashboard-metrics` (new capability)
- Affected code:
  - `src/lib/toggl/client.ts` - Add `fetchAllTimeEntries()` function
  - `src/lib/cache/` - New caching utility module
  - `src/app/api/metrics/hours-mtd/route.ts` - New API endpoint
  - `src/app/(admin)/dashboard/page.tsx` - Update StatCard to use real data
  - `src/app/(admin)/dashboard/components/` - Add HoursThisMonthCard component
