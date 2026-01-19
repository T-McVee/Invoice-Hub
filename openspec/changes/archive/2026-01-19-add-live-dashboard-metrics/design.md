# Design: Live Dashboard Metrics with Caching

## Context

The dashboard needs to display real-time metrics from Toggl Track. Toggl has rate limits, and we want to avoid unnecessary API calls while keeping data reasonably fresh. The app runs on Azure App Service (not serverless), so the Node.js process persists between requests.

## Goals / Non-Goals

**Goals:**
- Display real month-to-date hours on dashboard
- Cache Toggl API responses to avoid rate limits
- Handle API failures gracefully with stale data fallback
- Design cache layer to support additional metrics later

**Non-Goals:**
- Real-time (sub-minute) data freshness
- Distributed caching (Redis) - can upgrade later if needed
- Caching for other Toggl operations (timesheet creation uses fresh data)

## Decisions

### Decision 1: Server-side in-memory cache with TTL

**What:** Implement a simple in-memory cache module with configurable TTL per key.

**Why:** 
- Azure App Service keeps Node.js process alive, so memory cache persists across HTTP requests
- Simpler than Redis/external cache for current scale (1 client, personal tool)
- TanStack Query handles client-side caching between navigations (60s staleTime already configured)

**Alternatives considered:**
- Redis/Azure Cache: More robust but adds cost and complexity for a personal tool
- Next.js `unstable_cache`: Tied to Next.js internals, less control over TTL
- File-based cache: Slower, more complexity for no benefit

### Decision 2: Fetch all workspace time entries, aggregate server-side

**What:** New `fetchMonthToDateHours()` function fetches all time entries for the current month across the workspace, then sums durations.

**Why:**
- User wants total hours across all projects, not just configured clients
- Toggl `/me/time_entries` endpoint returns all entries for the authenticated user
- Aggregation is fast and can be cached

### Decision 3: Cache key structure and TTL

**What:** 
- Cache key: `toggl:hours-mtd:{YYYY-MM}` (includes month to auto-invalidate on month rollover)
- TTL: 10 minutes (600 seconds)
- Stale data returned with `isStale: true` flag when refresh fails

**Why:**
- 10-minute TTL balances freshness vs. rate limits
- Month in cache key ensures data refreshes naturally at month boundaries
- Stale fallback provides better UX than error states

## Data Flow

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Dashboard  │────▶│  /api/metrics/  │────▶│   Cache     │
│   (Client)   │     │   hours-mtd     │     │  (Memory)   │
└──────────────┘     └─────────────────┘     └──────┬──────┘
                              │                     │
                              │ cache miss/stale    │ cache hit
                              ▼                     │
                     ┌─────────────────┐           │
                     │   Toggl API     │◀──────────┘
                     └─────────────────┘
```

## Cache Module API

```typescript
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

interface CacheResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: Date;
}

// Simple API
cache.get<T>(key: string): CacheResult<T> | null
cache.set<T>(key: string, data: T, ttlSeconds: number): void
cache.getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number): Promise<CacheResult<T>>
```

## API Response Shape

```typescript
// GET /api/metrics/hours-mtd
{
  hours: number;        // Total hours this month
  month: string;        // "2026-01" format
  isStale: boolean;     // True if serving cached data after refresh failure
  cachedAt: string;     // ISO timestamp of when data was cached
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Cache lost on server restart | Acceptable for personal tool; cache rebuilds on first request |
| Stale data shown during outages | Clear visual indicator when data is stale |
| Memory growth with many cache keys | Limit to metrics only; consider LRU if expanding scope |

## Open Questions

None - all clarified in discussion.
