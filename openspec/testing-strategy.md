# Lightweight Testing Strategy

## Overview

This document outlines a lightweight automated test suite for Invoice Hub, aligned with the project's MVP-first philosophy. The goal is to ensure quality during development without over-investing in test infrastructure.

## Testing Philosophy

> **Test what matters**: Focus on critical paths that, if broken, would block the core workflow. Avoid testing trivial code or framework behavior.

- Start with the highest-value tests
- Keep test setup minimal
- Add tests incrementally as the system stabilizes
- Prefer integration tests over unit tests for API routes

## Recommended Tools

| Tool | Purpose | Rationale |
|------|---------|-----------|
| Vitest | Unit & integration tests | Fast, TypeScript-native, works well with Next.js |
| React Testing Library | Component tests | Standard for testing React components |
| Playwright | E2E tests (later) | Already has directory structure in place |

## Test Infrastructure Setup

### Phase 1: Minimal Setup

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

Create `vitest.config.mts` (uses `.mts` extension for ESM compatibility):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Use jsdom for component tests (.tsx files)
    environmentMatchGlobs: [
      ['src/**/*.test.tsx', 'jsdom'],
    ],
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
})
```

Create `src/test/setup.ts`:
```typescript
// Test setup file
// jest-dom matchers are loaded via environmentMatchGlobs for .tsx tests
```

## Priority Test Areas

### Priority 1: Core Business Logic (Must Have)

These are pure functions with no external dependencies - easy to test and high value.

| Module | Location | What to Test |
|--------|----------|--------------|
| Toggl client utilities | `src/lib/toggl/client.ts` | Time entry filtering, hour calculations, date range generation |
| Settings validation | `src/lib/settings/index.ts` | Zod schema validation, edge cases |
| Cache logic | `src/lib/cache/index.ts` | TTL expiration, stale data fallback |

**Example tests for Toggl utilities:**
```typescript
// src/lib/toggl/client.test.ts
describe('calculateTotalHours', () => {
  it('sums durations correctly', () => {
    const entries = [
      { duration: 3600 },  // 1 hour
      { duration: 1800 },  // 0.5 hours
    ]
    expect(calculateTotalHours(entries)).toBe(1.5)
  })

  it('excludes running entries (negative duration)', () => {
    const entries = [
      { duration: 3600 },
      { duration: -1 },  // running
    ]
    expect(calculateTotalHours(entries)).toBe(1)
  })
})
```

### Priority 2: API Route Integration Tests (Should Have)

Test API routes with mocked external dependencies (Toggl API, database).

| Route | What to Test |
|-------|--------------|
| `POST /api/clients` | Validation, duplicate prevention, success response |
| `DELETE /api/clients/[id]` | Cannot delete client with timesheets, success case |
| `POST /api/timesheets` | Validation, error handling for missing Toggl project |
| `PUT /api/settings/hourly-rate` | Validation (>= 0), success response |

**Example structure:**
```typescript
// src/app/api/clients/route.test.ts
import { POST } from './route'

describe('POST /api/clients', () => {
  it('creates a client with valid data', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it('rejects invalid email format', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        recipientEmails: ['not-an-email']
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

### Priority 3: Critical Component Tests (Nice to Have)

Only test components with significant logic, not presentation-only components.

| Component | What to Test |
|-----------|--------------|
| `CreateTimesheetForm` | Form submission, validation states |
| `HoursThisMonthCard` | Loading/error/stale states |
| `ImportTogglDialog` | Import flow, deduplication logic |

## What NOT to Test

Following the MVP-first philosophy, avoid testing:

- Shadcn UI wrapper components (`components/ui/*`)
- Simple presentation components (`ClientCard`, `StatCard`)
- Framework behavior (Next.js routing, React Query caching)
- Third-party library internals
- CSS/styling

## Test File Conventions

```
src/
├── lib/
│   ├── toggl/
│   │   ├── client.ts
│   │   └── client.test.ts      # Colocated tests
│   ├── cache/
│   │   ├── index.ts
│   │   └── index.test.ts
├── app/
│   └── api/
│       └── clients/
│           ├── route.ts
│           └── route.test.ts   # API route tests
```

## Mocking Strategy

### Toggl API

Create a mock Toggl client for tests:
```typescript
// src/test/mocks/toggl.ts
export const mockTogglClient = {
  fetchTimeEntries: vi.fn(),
  fetchTimesheetPdf: vi.fn(),
  fetchMonthToDateHours: vi.fn(),
  fetchClients: vi.fn(),
}
```

### Database

The current in-memory database is already test-friendly. Reset between tests:
```typescript
beforeEach(() => {
  // Clear mock database
  db.clear()
})
```

## Implementation Roadmap

### Stage 1: Foundation ✅
- [x] Install Vitest and configure
- [x] Create test setup file
- [x] Add `test` and `test:run` scripts
- [x] Write first test (cache utility)

### Stage 2: Core Logic ✅
- [x] Add tests for `src/lib/toggl/client.ts` utilities (13 tests)
- [x] Add tests for `src/lib/settings/index.ts` validation (25 tests)
- [x] Add tests for `src/lib/cache/index.ts` (11 tests)

### Stage 3: API Routes ✅
- [x] Add tests for client CRUD routes (20 tests)
- [x] Add tests for timesheet creation route (11 tests)
- [x] Add tests for settings routes (19 tests)

### Stage 4: E2E (Future)
When the application stabilizes:
- [ ] Configure Playwright
- [ ] Add E2E test for core workflow: Import client -> Create timesheet -> View dashboard

## CI Integration (Future)

When ready, add to CI pipeline:
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run test:run
```

## Success Metrics

The test suite is successful if:
1. Tests run in under 30 seconds
2. Tests catch regressions in critical paths
3. Tests don't slow down development velocity
4. Adding new tests is straightforward

## Notes

- This strategy prioritizes **speed to value** over comprehensive coverage
- Start with Stage 1-2, add Stage 3 as API routes stabilize
- E2E tests should wait until the UI stabilizes
- Revisit and expand as Invoice Hub moves toward productization
