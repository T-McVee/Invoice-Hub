# Change: Add PWA support to admin portal

## Why
The admin portal is used regularly on mobile and desktop for timesheet/invoice management. Making it installable as a Progressive Web App provides a native app-like experience — home screen access, standalone window, and basic offline resilience — without the overhead of a native app.

## What Changes
- Add a web app manifest scoped to the admin portal
- Add app icons (192x192, 512x512) for installation
- Add PWA meta tags to the admin layout (not root, so client portal is unaffected)
- Create a service worker with static asset caching and offline fallback
- Register the service worker from the admin layout
- Add an offline fallback page for when the network is unavailable

## Impact
- Affected specs: none (new capability)
- Affected code:
  - `src/app/(admin)/layout.tsx` — PWA meta tags and SW registration
  - `public/` — manifest, icons, service worker, offline page
  - `next.config.ts` — potential header configuration for SW caching
