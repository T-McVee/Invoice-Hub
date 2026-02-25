## Context

The admin portal was designed desktop-first. After adding PWA support (`add-admin-pwa`), the app is now installed on mobile phones where the fixed-layout navigation and data tables overflow the viewport. The primary user is the developer themselves, who uses the admin portal on the go.

## Goals / Non-Goals

- **Goals**:
  - Navigation usable on phones (375px+) without horizontal overflow
  - Data tables scrollable without requiring the user to scroll the whole page
  - Consistent, comfortable padding and typography on all screen sizes
  - Minimal code changes — Tailwind responsive prefixes only, no new libraries beyond the existing shadcn/ui Sheet component

- **Non-Goals**:
  - Rebuilding tables as card lists on mobile (horizontal scroll is acceptable for this personal tool)
  - Responsive design for the client portal (it is already simpler and does not exhibit the same issues)
  - Adding bottom-tab navigation (the Sheet/hamburger pattern is sufficient and consistent with typical PWA conventions)

## Decisions

- **Mobile nav pattern — Sheet/drawer (hamburger)**
  - The existing horizontal nav pill contains 6 items with labels (`Dashboard`, `Timesheets`, `Invoices`, `Clients`, `Analytics`, `Settings`). Even icon-only at 6 items would be tight on a 375px phone.
  - A Sheet (shadcn/ui `Sheet` component, already available in the project) opened by a `Menu` icon gives each nav item full-width tap targets, which aligns with PWA usability guidelines.
  - Alternatives considered:
    - *Icon-only inline nav*: Simpler but 6 icons without labels reduce discoverability; the icon row still risks overflow on very small screens.
    - *Bottom navigation bar*: Common PWA pattern but requires a significant layout restructure (adding padding to main to avoid overlap). Out of scope for this change.

- **Table treatment — keep `overflow-x-auto`, reduce padding**
  - Tables already have `overflow-x-auto` wrappers. The remaining friction is the `px-6 py-4` cell padding making the table much wider than its content. Halving the padding on mobile (`px-3 py-3`) reduces scroll distance noticeably while keeping the same structure.
  - A full mobile card layout would require duplicating rendering logic and is overkill for a personal tool with small data sets.

## Risks / Trade-offs

- **Sheet import**: The `Sheet` component must be present in `src/components/ui/`. If it hasn't been added via `shadcn/ui add sheet`, it needs to be added. The task list includes a verification step.
- **Existing glass/nav visual**: The active-indicator underline (`absolute bottom-0 …`) inside each nav button is a desktop-only concern; it should be hidden or removed from the Sheet variant to keep the drawer clean.

## Open Questions

- None — scope is clearly bounded to Tailwind responsive classes + one shadcn/ui component addition.
