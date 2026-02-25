# Change: Improve Mobile Responsiveness of Admin Portal

## Why

The admin portal has been adapted as a PWA and is now regularly used on mobile devices. Several UI elements break or overflow on small screens: the top navigation bar extends off-screen on phones, data tables require excessive horizontal scrolling, and page headings and layout padding are fixed at desktop sizes. These issues degrade the experience for a PWA that is expected to be installed and used natively on mobile.

## What Changes

- **Navigation bar**: Add a hamburger menu for small screens (below `md`) that opens a side Sheet/drawer containing all nav links; hide the horizontal pill-style nav on mobile and show it only on `md+`
- **Layout padding**: Reduce horizontal padding from fixed `px-6` to responsive `px-4 sm:px-6` on both the nav container and the main content wrapper
- **Data tables**: Reduce cell padding from `px-6 py-4` to `px-3 py-3 sm:px-6 sm:py-4` so tables are narrower on mobile and the existing `overflow-x-auto` wrapper is less painful to scroll
- **Page headings**: Scale `h1` from `text-3xl` (desktop) down to `text-2xl sm:text-3xl` to prevent large headings from crowding small viewports
- **Clients page header**: Make the action button strip (`flex gap-3`) wrap gracefully by switching to `flex-wrap` so the "Import from Toggl" button drops below the title on very narrow screens rather than overflowing

## Impact

- Affected specs: none currently (new capability `mobile-responsiveness`)
- Affected code:
  - `src/app/(admin)/layout.tsx` — nav bar: hamburger menu + responsive padding
  - `src/app/(admin)/timesheets/page.tsx` — table cell padding
  - `src/app/(admin)/invoices/page.tsx` — table cell padding
  - `src/app/(admin)/clients/page.tsx` — header flex-wrap
  - All admin pages share the `h1` heading pattern (updated per page)
