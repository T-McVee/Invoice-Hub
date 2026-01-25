# Change: Secure PDF Access with Portal Authentication

## Why

The timesheet PDF endpoint (`GET /api/timesheets/[id]/pdf`) is currently unauthenticated. Anyone who knows or guesses a timesheet ID can download its PDF, exposing sensitive billing data (hours, rates, client information). This contradicts the security model where the client portal properly authenticates all other data access via JWT tokens.

## What Changes

- **Add authenticated PDF endpoint** at `GET /api/portal/[token]/timesheets/[id]/pdf` that validates JWT and verifies timesheet ownership before serving the PDF
- **Update client portal UI** to use the new authenticated endpoint for PDF downloads
- **Keep legacy endpoint for admin use** - the existing `/api/timesheets/[id]/pdf` remains accessible for the admin portal (which lacks authentication). This is a known limitation until admin authentication is implemented.

## Scope Limitation

The admin portal currently has no authentication. Securing admin PDF access requires implementing admin auth first, which is tracked separately. This change focuses on securing the client-facing portal.

## Impact

- Affected specs: `client-portal`, `persistence`
- Affected code:
  - `src/app/api/portal/[token]/timesheets/[id]/pdf/route.ts` (new)
  - `src/app/portal/[token]/page.tsx` (update PDF link)
- NOT affected:
  - `src/app/api/timesheets/[id]/pdf/route.ts` (unchanged for now)
  - `src/app/(admin)/timesheets/page.tsx` (continues using legacy endpoint)
