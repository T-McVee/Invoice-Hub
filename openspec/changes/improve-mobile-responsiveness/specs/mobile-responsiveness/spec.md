## ADDED Requirements

### Requirement: Responsive Admin Navigation
The admin portal navigation SHALL collapse on viewports narrower than the `md` breakpoint (768 px). On small screens the horizontal pill-style nav links SHALL be hidden and replaced with a hamburger icon button that opens a Sheet/drawer containing all navigation links with their labels. The horizontal nav SHALL be visible only on `md` and larger screens. The logo and logout button SHALL remain visible in the top bar on all screen sizes.

#### Scenario: Small screen — nav links hidden, hamburger shown
- **WHEN** the admin portal is viewed on a viewport narrower than 768 px
- **THEN** the horizontal navigation pill (all six nav links) is not visible
- **AND** a hamburger (`Menu` icon) button is shown in the top bar

#### Scenario: Hamburger opens navigation drawer
- **WHEN** the user taps the hamburger icon on a small screen
- **THEN** a Sheet/drawer opens containing all six navigation links with their icons and labels
- **AND** the active page link is visually distinguished within the drawer

#### Scenario: Drawer closes after navigation
- **WHEN** the user taps a navigation link inside the open drawer
- **THEN** the drawer closes and the user is navigated to the selected page

#### Scenario: Large screen — horizontal nav visible, hamburger hidden
- **WHEN** the admin portal is viewed on a viewport 768 px wide or wider
- **THEN** the horizontal navigation pill is visible
- **AND** the hamburger icon button is not rendered

---

### Requirement: Responsive Layout Padding
The admin portal's navigation bar container and main content wrapper SHALL use responsive horizontal padding: `px-4` on mobile (default) and `px-6` on `sm` (640 px) and larger breakpoints.

#### Scenario: Mobile padding is reduced
- **WHEN** the admin portal is viewed on a viewport narrower than 640 px
- **THEN** the horizontal padding on the nav container and main content area is 1 rem (16 px) per side

#### Scenario: Desktop padding is standard
- **WHEN** the admin portal is viewed on a viewport 640 px wide or wider
- **THEN** the horizontal padding on the nav container and main content area is 1.5 rem (24 px) per side

---

### Requirement: Responsive Table Cell Padding
Data tables in the Timesheets and Invoices pages SHALL use reduced cell padding on mobile to limit the minimum scroll width. Cells SHALL use `px-3 py-3` on mobile (default) and `px-6 py-4` on `sm` (640 px) and larger. The `overflow-x-auto` horizontal scroll container SHALL be preserved on all screen sizes.

#### Scenario: Mobile table has compact padding
- **WHEN** the Timesheets or Invoices page is viewed on a viewport narrower than 640 px
- **THEN** table cells use 0.75 rem (12 px) horizontal padding and 0.75 rem vertical padding
- **AND** the table is horizontally scrollable within its container

#### Scenario: Desktop table has standard padding
- **WHEN** the Timesheets or Invoices page is viewed on a viewport 640 px wide or wider
- **THEN** table cells use 1.5 rem (24 px) horizontal padding and 1 rem (16 px) vertical padding

---

### Requirement: Responsive Page Headings
Admin page primary headings (`h1`) SHALL scale responsively: `text-2xl` on mobile (default) and `text-3xl` on `sm` (640 px) and larger.

#### Scenario: Mobile heading is smaller
- **WHEN** any admin page is viewed on a viewport narrower than 640 px
- **THEN** the primary page heading renders at the `text-2xl` size (1.5 rem)

#### Scenario: Desktop heading is full size
- **WHEN** any admin page is viewed on a viewport 640 px wide or wider
- **THEN** the primary page heading renders at the `text-3xl` size (1.875 rem)

---

### Requirement: Responsive Clients Page Action Header
The Clients page header row (title + action buttons) SHALL allow its action button group to wrap to a second line on narrow screens rather than overflowing or truncating.

#### Scenario: Narrow screen — button wraps below title
- **WHEN** the Clients page is viewed on a viewport where the title and button group cannot fit side by side
- **THEN** the action buttons wrap below the page title with appropriate vertical spacing

#### Scenario: Wide screen — title and button on same row
- **WHEN** the Clients page is viewed on a viewport wide enough to fit the title and button group
- **THEN** the title and action button group remain on the same horizontal row
