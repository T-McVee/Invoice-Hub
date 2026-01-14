# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server

# Code quality
npm run lint             # ESLint
npm run format           # Prettier format
npm run format:check     # Check formatting

# Testing
npm test                 # Vitest watch mode
npm run test:run         # Single test run (CI)
npx vitest src/lib/cache/index.test.ts  # Run single test file
```

## Workflow Requirements

**Before starting any work**, run the test suite:
```bash
npm run test:run
```

If any tests are failing, fix them first before proceeding with new work.

**After completing work**, run the test suite again to ensure all tests pass. The task is not complete until all tests are passing.

## Architecture

### Project Purpose
Personal tool to automate timesheet and invoice generation from Toggl Track. Two portals:
- **Admin portal** (`(admin)/`): Dashboard, client management, timesheets, invoices, settings
- **Client portal** (`portal/[token]/`): Token-based access for timesheet approval

### Tech Stack
Next.js 16 (App Router), TypeScript (strict), TanStack Query, shadcn/ui, Tailwind CSS, Zod validation

### Folder Structure
```
src/
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin portal routes (grouped layout)
│   ├── portal/[token]/    # Client portal (token-authenticated)
│   └── api/               # API routes
├── lib/                   # Shared utilities and services
│   ├── toggl/            # Toggl API client
│   ├── cache/            # TTL cache with stale data fallback
│   ├── settings/         # Business profile & hourly rate (in-memory)
│   ├── hooks/            # React Query hooks
│   └── db/               # Mock database (in-memory)
├── components/ui/        # shadcn/ui components
└── types/                # Shared TypeScript types
```

### Key Patterns
- **Separation of concerns**: UI components render only; logic in hooks/services/utilities
- **Data flow**: Server state via TanStack Query, minimal client state
- **Colocation**: Related files grouped by feature/route (e.g., `dashboard/components/`)
- **Queries colocated**: `*.queries.ts` files next to page components

### Data Flow
1. Fetch time entries from Toggl Track API
2. Generate timesheet PDF via Toggl Reports API
3. Client approves timesheet in portal
4. Generate invoice via Invoice Generator API
5. Email via Resend

## Conventions

### Naming
- Files/folders: `kebab-case`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Types/interfaces: `PascalCase`

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Main branch reflects production

### Development Philosophy
MVP-first: prioritize speed to working prototype over feature completeness. Ship fast, iterate.

## Testing

Vitest with node environment (jsdom for `.tsx` files). Tests colocated with source files.

```typescript
// Example test pattern
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('module', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does something', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response)
    // ...
  })
})
```

Use `vi.stubEnv()` for environment variables, `vi.useFakeTimers()` for time-dependent tests.

## Reference

- `openspec/project.md` - Authoritative project spec with domain context
- `openspec/testing-strategy.md` - Testing approach and roadmap
- `AGENTS.md` - OpenSpec instructions for proposals/big changes
