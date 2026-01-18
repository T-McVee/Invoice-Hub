## Context

Invoice Hub currently uses in-memory JavaScript Maps for all data storage. This was intentional for MVP speed but means:
- All data is lost on server restart
- No data persistence between deployments
- Cannot be used in production

The application is designed for deployment to Azure App Service, and the project spec already identifies Azure SQL Database as the target persistence layer.

### Constraints
- Must use Azure SQL Free tier (32GB, 100k vCore seconds/month)
- Maintain existing repository function signatures to minimize API route changes
- MVP-first: simple implementation, no over-engineering

## Goals / Non-Goals

**Goals:**
- Persistent data storage that survives restarts
- Type-safe database access with TypeScript
- Simple schema matching existing data models
- Secure authentication via Azure Entra ID (no SQL passwords)

**Non-Goals:**
- Multi-tenant architecture
- Read replicas or advanced scaling
- Complex migrations or versioning (simple schema for now)
- Soft deletes or audit trails (add later if needed)

## Decisions

### Decision 1: Use Prisma ORM

**Why:** Prisma provides TypeScript-first database access with auto-generated types, migrations, and excellent DX. It's the standard choice for Next.js projects.

**Alternatives considered:**
- Raw SQL with `mssql` package: More control but requires manual type definitions and query building
- Drizzle ORM: Good alternative but less mature Azure SQL support
- TypeORM: Heavier, decorator-based approach doesn't fit project style

### Decision 2: Schema Design

Tables mirror existing TypeScript interfaces:

```
┌─────────────────┐     ┌─────────────────┐
│     Client      │     │    Timesheet    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ id (PK)         │
│ name            │     │ clientId (FK)   │
│ togglClientId   │     │ month           │
│ togglProjectId  │     │ status          │
│ timesheetRec[]  │     │ pdfUrl          │
│ invoiceRec[]    │     │ totalHours      │
│ notes           │     │ sentAt          │
│ createdAt       │     │ approvedAt      │
│ updatedAt       │     │ createdAt       │
└─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    Contact      │     │    Invoice      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ clientId (FK)   │     │ clientId (FK)   │
│ name            │     │ timesheetId (FK)│
│ email           │     │ invoiceNumber   │
│ role            │     │ amount          │
└─────────────────┘     │ status          │
                        │ pdfUrl          │
                        │ sentAt          │
                        │ paidAt          │
                        │ createdAt       │
                        └─────────────────┘

┌─────────────────┐
│    Settings     │
├─────────────────┤
│ id (PK)         │
│ key (UNIQUE)    │
│ value (JSON)    │
│ updatedAt       │
└─────────────────┘
```

**Key decisions:**
- `timesheetRecipients` and `invoiceRecipients` stored as JSON arrays (simple, avoids junction tables)
- Contacts remain as separate table (normalized, supports multiple contacts per client)
- Settings use key-value pattern with JSON values (flexible, simple)
- UUIDs for primary keys (matches current ID generation pattern)

### Decision 3: Connection Management

Use Prisma's built-in connection pooling with environment-based configuration:

```typescript
// Single Prisma client instance
const prisma = new PrismaClient();

// Connection string from environment
DATABASE_URL="sqlserver://..."
```

For Azure SQL Free tier, default pool size (5 connections) is sufficient.

### Decision 4: Repository Pattern Preserved

Keep the same function signatures:

```typescript
// Before (in-memory)
export function getClients(): Client[]

// After (Prisma)
export async function getClients(): Promise<Client[]>
```

Main change: functions become async. API routes already handle async so impact is minimal.

### Decision 5: Authentication via Azure Entra ID

**Why:** Managed identity eliminates secrets management in production. Using `ActiveDirectoryDefault` provides a unified approach that works in both environments.

**How it works:**

```
┌─────────────────────────────────────────────────────────────┐
│              ActiveDirectoryDefault Auth Chain              │
├─────────────────────────────────────────────────────────────┤
│  1. Environment variables (service principal) ──► skipped   │
│  2. Managed Identity ──► ✓ used in Azure App Service        │
│  3. Azure CLI (`az login`) ──► ✓ used in local dev          │
│  4. VS Code Azure extension                                 │
│  5. Azure PowerShell                                        │
└─────────────────────────────────────────────────────────────┘
```

**Connection string (same for all environments):**
```
sqlserver://your-server.database.windows.net:1433;database=invoice-hub;authentication=ActiveDirectoryDefault;trustServerCertificate=true
```

**Production setup (App Service):**
1. Enable system-assigned managed identity on App Service
2. Grant identity access to Azure SQL:
   ```sql
   CREATE USER [your-app-service-name] FROM EXTERNAL PROVIDER;
   ALTER ROLE db_datareader ADD MEMBER [your-app-service-name];
   ALTER ROLE db_datawriter ADD MEMBER [your-app-service-name];
   ALTER ROLE db_ddladmin ADD MEMBER [your-app-service-name];  -- for migrations
   ```

**Local development setup:**
1. Install Azure CLI
2. Run `az login` once
3. Grant developer access to Azure SQL:
   ```sql
   CREATE USER [developer@domain.com] FROM EXTERNAL PROVIDER;
   ALTER ROLE db_datareader ADD MEMBER [developer@domain.com];
   ALTER ROLE db_datawriter ADD MEMBER [developer@domain.com];
   ALTER ROLE db_ddladmin ADD MEMBER [developer@domain.com];  -- for migrations
   ```

**Alternatives considered:**
- SQL Authentication: Simple but requires secret management and rotation
- Separate auth per environment: Works but more configuration to maintain
- Service Principal everywhere: Requires client secret, less secure than managed identity

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Azure SQL Free tier limits | 100k vCore seconds/month is plenty for personal use; monitor usage |
| Cold start latency | Prisma client is lazy; first query may be slower |
| Schema drift | Use Prisma migrations; run `prisma migrate deploy` on deploy |
| Auth chain latency | `ActiveDirectoryDefault` tries methods in order; slight delay on first connection |
| Azure CLI dependency | Developers must have Azure CLI installed and run `az login`; documented in setup |
| Token expiry | Azure CLI tokens expire; re-run `az login` if connection fails locally |

## Migration Plan

1. **Phase 1: Schema & Prisma Setup**
   - Add Prisma dependencies
   - Create schema matching existing types
   - Configure Azure SQL connection

2. **Phase 2: Repository Migration**
   - Replace `mock-data.ts` with Prisma queries
   - Replace `settings/index.ts` with database-backed settings
   - Update imports (function signatures stay same, just async)

3. **Phase 3: API Route Updates**
   - Add `await` to repository calls in API routes
   - Test all CRUD operations

4. **Rollback:** Revert to in-memory by restoring `mock-data.ts` and removing Prisma (changes are additive, easy to undo).

## Open Questions

- [ ] Should we seed default data on first run? (Currently has hardcoded "Acme Corporation" client)
- [x] ~~Local development: use Azure SQL directly or set up local SQL Server?~~ → Use Azure SQL directly with `ActiveDirectoryDefault` auth via Azure CLI
