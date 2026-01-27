# Project Context

## Purpose

Invoice Hub is a personal tool (with potential for productization) that automates timesheet and invoice generation from Toggl Track time entries. It provides two portals: an **admin portal** for the owner to manage clients, view history, and analytics; and a **client portal** where clients access and approve their timesheets and invoices.

### Core Workflow

1. **Monthly Pull (1st of month)**: Fetch time entries and PDF detailed timesheet from Toggl Track for the prior month
2. **Client Notification**: Email the timesheet to the client with a link to the portal
3. **Timesheet Approval**: Client reviews and approves the timesheet in the portal
4. **Invoice Generation**: Upon approval, generate an invoice via Invoice Generator API
5. **Invoice Delivery**: Email the invoice to the designated contact and make it available for download in the portal

### Admin Portal Features

- View all past generated timesheets
- View all past generated invoices
- Analytics and reporting (hours by client, revenue over time, etc.)
- Client management
- Manually generate and send a timesheet for a specific month/client (on-demand, outside the automated monthly cycle)

### Target Users

- **Primary**: The developer (personal use for freelance/consulting work) via admin portal
- **Secondary**: Clients who receive and approve timesheets/invoices via the client portal

## Tech Stack

### Core Application

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js (App Router)
- **UI**: React
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (customizable, accessible components built on Radix UI)
- **State/Data**: TanStack Query for server state management

### Backend Services

- **Platform**: Azure App Service (deployment target)
- **Database**: Azure SQL Database
- **File Storage**: Azure Blob Storage (for storing PDFs)
- **Email**: Resend (100 emails/day free tier, excellent DX)

### External Integrations

- **Toggl Track API**: Time entries, workspace data, and detailed timesheet PDFs
- **Invoice Generator API**: Invoice PDF generation ([invoice-generator.com](https://invoice-generator.com/developers))

## Project Conventions

### Development Philosophy

> **MVP-first**: Prioritize speed to working prototype over feature completeness and robustness. Get value delivered quickly, then iterate.

- Start simple, add complexity only when needed
- Working software over perfect architecture
- Ship fast, learn fast, iterate

### Code Style

- **Formatter**: Prettier (default config)
- **Linting**: ESLint with standard rules
- **Naming**:
  - Files/folders: `kebab-case`
  - Components: `PascalCase`
  - Functions/variables: `camelCase`
  - Types/interfaces: `PascalCase`

### Architecture Patterns

- **Folder Structure**: Colocation - keep related files together by feature/route
- **Separation of Concerns**: Business logic lives outside UI components
  - UI components handle rendering and user interaction only
  - Logic extracted to hooks, utilities, or service modules
- **Data Flow**:
  - Server state via TanStack Query
  - Minimal client state (prefer URL state, server state)

### Example Structure (Next.js)

```
src/
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin portal routes (grouped layout)
│   │   ├── dashboard/     # Dashboard with timesheet creation
│   │   ├── timesheets/    # Timesheet list and management
│   │   ├── invoices/      # Invoice management (future)
│   │   ├── clients/       # Client management
│   │   └── settings/      # Business profile, hourly rate
│   ├── portal/[token]/    # Client portal (JWT-authenticated)
│   └── api/               # API routes
│       ├── clients/       # Client CRUD
│       ├── timesheets/    # Timesheet CRUD + PDF proxy
│       ├── portal/        # Portal data + approval endpoints
│       └── settings/      # Business profile, hourly rate
├── lib/                   # Shared utilities and services
│   ├── toggl/            # Toggl API client
│   ├── blob/             # Azure Blob Storage client (PDF storage)
│   ├── auth/             # JWT utilities for portal tokens
│   ├── cache/            # TTL cache with stale data fallback
│   ├── settings/         # Business profile & hourly rate service
│   ├── hooks/            # React Query hooks
│   └── db/               # Prisma repositories
├── components/ui/        # shadcn/ui components
└── types/               # Shared TypeScript types
```

### Testing Strategy

MVP phase: Manual testing, add automated tests as system stabilizes

- **Unit**: Vitest for business logic (when needed)
- **E2E**: Playwright for critical flows (when needed)

### Git Workflow

- **Strategy**: GitLab Flow
  - `main` branch reflects production
  - Feature branches for development
  - Environment branches if needed (staging, production)
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- **Merge**: Merge requests for code review

### Planning & Tracking Tools

- **OpenSpec**: Plan and document significant work (proposals, specs, tasks)
- **Beads**: Track individual tasks across sessions (each OpenSpec task becomes a bead)

Workflow: OpenSpec for planning → Beads for tracking → Archive when complete. See `AGENTS.md` for details.

## Domain Context

### Key Entities

- **Client**: A business or individual who receives invoices
- **Contact**: A person at a client who receives emails (approver, billing contact)
- **Timesheet**: Monthly summary of time entries, pulled from Toggl (PDF from Toggl API)
- **Invoice**: Generated document based on approved timesheet (PDF from Invoice Generator API)
- **Time Entry**: Individual work session from Toggl Track

### Business Rules

- Timesheets are generated monthly (calendar month boundaries)
- A timesheet must be approved before an invoice can be generated
- Invoices are immutable once generated
- Client portal access is token-based (no client account creation required)

### Authentication

**Admin Portal** uses Azure App Service Authentication (Easy Auth) with Microsoft Entra ID:
- Auth handled at platform level before requests reach the application
- No auth code to maintain - configured entirely in Azure Portal
- Middleware (`src/middleware.ts`) redirects unauthenticated requests to `/.auth/login/aad`
- Logout via `/.auth/logout` (button in admin header)
- Local development: Easy Auth only works on Azure, so admin routes are unprotected locally

**Client Portal** uses JWT-based token authentication:
- Each client gets a unique portal URL with embedded token
- Tokens signed with `JWT_SECRET` environment variable
- Auth handled in route handlers (`src/lib/auth/jwt.ts`)

**Path Routing** (in middleware):
| Path | Auth |
|------|------|
| `/portal/*`, `/api/portal/*` | Allow through (JWT auth in handlers) |
| `/.auth/*` | Allow through (Easy Auth endpoints) |
| Admin routes | Require `x-ms-client-principal` header (set by Easy Auth) |

See `openspec/specs/admin-auth/spec.md` for detailed requirements.

### Toggl Track Concepts

- **Workspace**: Container for projects and time entries
- **Project**: Typically maps to a client or engagement
- **Time Entry**: Individual tracked work session with duration, description, project

### Current Scale

- **Clients**: 1 (may grow over time)
- Design for simplicity now, can scale architecture later if needed

## Important Constraints

### Technical

- **Cost**: Prefer free-tier services; minimize ongoing costs for personal use
- **Simplicity**: Over-engineering should be avoided; this is a personal tool first
- **Azure Ecosystem**: Deploy to Azure App Service, use Azure SQL and Blob Storage
- **Speed**: MVP-first approach; ship working software quickly

### Business

- **Data Retention**: Keep invoices and timesheets indefinitely (legal/tax requirements)
- **Security**: Client portal must be secure (token-based access, HTTPS only)

## External Dependencies

### APIs

| Service                                                           | Purpose                                      | Auth Method | Free Tier                          |
| ----------------------------------------------------------------- | -------------------------------------------- | ----------- | ---------------------------------- |
| Toggl Track API                                                   | Time entries, workspace data, PDF timesheets | API token   | Yes (with paid Toggl subscription) |
| [Invoice Generator API](https://invoice-generator.com/developers) | Invoice PDF generation                       | API key     | 100 invoices/month                 |

### Azure Services

| Service            | Purpose             | Notes                   |
| ------------------ | ------------------- | ----------------------- |
| Azure App Service  | Application hosting | Deployment target       |
| Azure SQL Database | Persistent storage  | Relational data         |
| Azure Blob Storage | PDF storage         | Timesheets and invoices |

### Other Services

| Service                      | Purpose              | Notes                             |
| ---------------------------- | -------------------- | --------------------------------- |
| [Resend](https://resend.com) | Transactional emails | 100/day free, React Email support |

## Open Decisions

None currently - all major decisions resolved!

## Resolved Decisions

- [x] **Database**: Azure SQL Database
- [x] **Deployment**: Azure App Service
- [x] **PDF Generation**: Toggl API (timesheets) + Invoice Generator API (invoices) - no library needed
- [x] **Git Workflow**: GitLab Flow
- [x] **Development Philosophy**: MVP-first, speed over robustness
- [x] **Email Provider**: Resend
- [x] **Framework**: Next.js (App Router)
- [x] **Admin Auth**: Azure Easy Auth with Microsoft Entra ID (see Authentication section)
