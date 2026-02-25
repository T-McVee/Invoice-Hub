## 1. Prerequisites
- [ ] 1.1 Verify `Sheet` component is available at `src/components/ui/sheet.tsx`; if missing, add it via `npx shadcn@latest add sheet`

## 2. Responsive Navigation
- [ ] 2.1 In `src/app/(admin)/layout.tsx`, wrap the existing horizontal nav pill in `hidden md:flex` so it is hidden on mobile
- [ ] 2.2 Add a `<Sheet>` component (shadcn/ui) rendered only on mobile (`md:hidden`) containing a `SheetTrigger` with a `Menu` icon button and a `SheetContent` with all nav links
- [ ] 2.3 Pass a close-sheet callback to each nav link inside the Sheet so the drawer closes on navigation
- [ ] 2.4 Ensure the logout button and logo remain visible in the top bar on all screen sizes

## 3. Responsive Layout Padding
- [ ] 3.1 In `src/app/(admin)/layout.tsx`, change `px-6` to `px-4 sm:px-6` on both the nav bar container (`<div className="max-w-7xl …">`) and the main content wrapper (`<main …>`)

## 4. Responsive Page Headings
- [ ] 4.1 In `src/app/(admin)/timesheets/page.tsx`, change `text-3xl` to `text-2xl sm:text-3xl` on the `h1`
- [ ] 4.2 In `src/app/(admin)/invoices/page.tsx`, change `text-3xl` to `text-2xl sm:text-3xl` on the `h1`
- [ ] 4.3 In `src/app/(admin)/clients/page.tsx`, change `text-3xl` to `text-2xl sm:text-3xl` on the `h1`
- [ ] 4.4 In `src/app/(admin)/dashboard/page.tsx`, change `text-3xl` to `text-2xl sm:text-3xl` on the `h1`

## 5. Responsive Table Padding
- [ ] 5.1 In `src/app/(admin)/timesheets/page.tsx`, change all `px-6 py-4` on `<th>` and `<td>` elements to `px-3 py-3 sm:px-6 sm:py-4`
- [ ] 5.2 In `src/app/(admin)/invoices/page.tsx`, change all `px-6 py-4` on `<th>` and `<td>` elements to `px-3 py-3 sm:px-6 sm:py-4`

## 6. Clients Page Header Wrapping
- [ ] 6.1 In `src/app/(admin)/clients/page.tsx`, change the page header row from `flex items-start justify-between` to `flex flex-wrap items-start justify-between gap-y-3` so the button group wraps on narrow screens

## 7. Validation
- [ ] 7.1 Run `npm run test:run` and confirm all tests pass
- [ ] 7.2 Run `npm run lint` and confirm no lint errors introduced
- [ ] 7.3 Manually verify navigation on a 375 px viewport (Chrome DevTools mobile emulation): hamburger opens/closes, all links work, active state shows correctly in drawer
- [ ] 7.4 Manually verify Timesheets and Invoices pages on 375 px: table scrolls horizontally, padding is reduced, heading is `text-2xl`
- [ ] 7.5 Manually verify Clients page on 375 px: heading is `text-2xl`, button wraps below title if needed
