# Change: Add Global Hourly Rate with Estimated Earnings Display

## Why

The dashboard currently shows hours tracked month-to-date, but without context for what those hours are worth. Adding a configurable global hourly rate enables displaying estimated earnings in a dedicated card, giving immediate visibility into monthly revenue without manual calculation.

## What Changes

- Add a global settings store with a default hourly rate value
- Create API endpoint to get/set the hourly rate setting
- Create new API endpoint `/api/metrics/earnings-mtd` for estimated earnings
- Add new "Estimated Earnings" card to the dashboard (separate from Hours card)
- Add new "Settings" page under admin portal for configuring the hourly rate

## Impact

- Affected specs: `dashboard-metrics` (extends existing capability), `admin-settings` (new capability)
- Affected code:
  - `src/lib/settings/` - New settings store module
  - `src/app/api/settings/hourly-rate/route.ts` - New settings API endpoint
  - `src/app/api/metrics/earnings-mtd/route.ts` - New earnings endpoint
  - `src/app/(admin)/dashboard/components/earnings-this-month-card.tsx` - New earnings card component
  - `src/app/(admin)/dashboard/page.tsx` - Add earnings card to dashboard grid
  - `src/app/(admin)/settings/page.tsx` - New settings page
  - `src/components/ui/navigation-menu.tsx` - Add Settings nav link
