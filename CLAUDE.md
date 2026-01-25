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

# Database (Prisma)
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create new migration
npx prisma migrate deploy # Apply pending migrations
npx prisma studio        # Database browser GUI
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
Next.js 16 (App Router), TypeScript (strict), TanStack Query, shadcn/ui, Tailwind CSS, Zod validation, Prisma ORM, Azure SQL Database

### Folder Structure
```
src/
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin portal routes (grouped layout)
│   ├── portal/[token]/    # Client portal (token-authenticated)
│   └── api/               # API routes
├── lib/                   # Shared utilities and services
│   ├── toggl/            # Toggl API client
│   ├── blob/             # Azure Blob Storage client (PDF storage)
│   ├── auth/             # JWT utilities for portal tokens
│   ├── cache/            # TTL cache with stale data fallback
│   ├── settings/         # Business profile & hourly rate (database-backed)
│   ├── hooks/            # React Query hooks
│   └── db/               # Prisma repositories (Azure SQL)
├── components/ui/        # shadcn/ui components
└── types/                # Shared TypeScript types
```

### Environment Variables
```bash
# Database
DATABASE_URL                      # Azure SQL connection string

# Toggl API
TOGGL_API_TOKEN                   # Toggl Track API token
TOGGL_WORKSPACE_ID                # Toggl workspace ID

# Azure Blob Storage (PDF persistence)
AZURE_STORAGE_CONNECTION_STRING   # Azure Storage account connection string
AZURE_STORAGE_CONTAINER           # Container name for PDF files

# Authentication
JWT_SECRET                        # Secret for signing portal JWT tokens
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

## Planning & Tracking

This project uses **two complementary tools** for planning and work tracking:

### OpenSpec (Planning)
Use OpenSpec for **planning significant work** - features, breaking changes, architecture shifts.

```bash
openspec list                    # See active changes
openspec validate <id> --strict  # Validate a change
openspec archive <id> --yes      # Archive after completion
```

**What it creates**: `proposal.md`, `design.md`, `tasks.md`, and spec deltas under `openspec/changes/<change-id>/`

### Beads (Work Tracking)
Use Beads for **tracking individual tasks** across sessions. Create a bead for each OpenSpec task.

```bash
bd ready                         # Find available work
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id>
bd sync                          # Push to remote
```

### Integrated Workflow

1. **Plan with OpenSpec** - Create proposal with `tasks.md` listing implementation steps
2. **Create beads** - One bead per task in `tasks.md` (use `bd create`)
3. **Implement** - Work through beads, marking complete as you go
4. **Sync OpenSpec** - Update task checkboxes in `tasks.md` as beads close
5. **Archive** - Once all beads closed, run `openspec archive <id> --yes`

See `AGENTS.md` for detailed session workflow and `openspec/AGENTS.md` for OpenSpec specifics.

## Reference

- `openspec/project.md` - Authoritative project spec with domain context
- `openspec/AGENTS.md` - OpenSpec instructions for proposals/big changes
- `.beads/` - Issue tracking data (git-synced)
