# Change: Add Azure SQL Database Persistence

## Why

The current in-memory data store (`src/lib/db/mock-data.ts` and `src/lib/settings/index.ts`) loses all data on server restart. This is acceptable for MVP development but blocks production deployment. Azure SQL Free tier provides 32GB storage with 100,000 vCore seconds/month at no cost, making it ideal for this personal tool.

## What Changes

- **NEW**: Prisma ORM integration with Azure SQL connection
- **NEW**: Database schema for Clients, Contacts, Timesheets, Invoices, and Settings
- **MODIFIED**: Repository functions in `src/lib/db/` to use Prisma instead of in-memory Maps
- **MODIFIED**: Settings functions in `src/lib/settings/` to persist to database
- **REMOVED**: In-memory storage (Map-based stores replaced)

## Impact

- **Affected specs**:
  - `admin-settings` - Settings now persist across restarts
  - `client-management` - Client data now persists
- **Affected code**:
  - `src/lib/db/mock-data.ts` → replaced with Prisma repositories
  - `src/lib/settings/index.ts` → replaced with database-backed settings
  - `src/types/index.ts` → types generated from Prisma schema
  - New: `prisma/schema.prisma` database schema
  - New: Environment configuration for database connection
