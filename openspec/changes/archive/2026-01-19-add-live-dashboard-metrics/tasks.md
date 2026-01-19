# Tasks: Add Live Dashboard Metrics

## 1. Cache Infrastructure

- [x] 1.1 Create `src/lib/cache/index.ts` with in-memory cache module
- [x] 1.2 Implement `get`, `set`, and `getOrFetch` methods with TTL support
- [x] 1.3 Add stale data tracking (`isStale`, `cachedAt` in response)

## 2. Toggl Client Extension

- [x] 2.1 Add `fetchMonthToDateHours()` function to `src/lib/toggl/client.ts`
- [x] 2.2 Calculate MTD date range (1st of current month to today)
- [x] 2.3 Sum all time entry durations and return hours

## 3. API Endpoint

- [x] 3.1 Create `src/app/api/metrics/hours-mtd/route.ts`
- [x] 3.2 Integrate cache layer with 10-minute TTL
- [x] 3.3 Return hours, month, isStale, and cachedAt in response
- [x] 3.4 Handle Toggl API errors with stale fallback

## 4. Dashboard Integration

- [x] 4.1 Create `HoursThisMonthCard` component with loading/error states
- [x] 4.2 Add TanStack Query hook to fetch `/api/metrics/hours-mtd`
- [x] 4.3 Replace hardcoded "Hours This Month" StatCard with new component
- [x] 4.4 Show stale data indicator when `isStale: true`

## 5. Validation

- [x] 5.1 Test with valid Toggl credentials - verify hours match Toggl UI
- [x] 5.2 Test cache behavior - verify no API call within TTL window
- [x] 5.3 Test error handling - disconnect network, verify stale fallback
