## 1. Azure Infrastructure Setup

- [x] 1.1 Create Azure SQL Database (free tier) in Azure Portal
- [x] 1.2 Configure Azure SQL firewall to allow Azure services
- [x] 1.3 Set Azure Entra ID admin on the SQL Server
- [x] 1.4 Enable system-assigned managed identity on App Service
- [x] 1.5 Create database user for App Service managed identity (SQL script)
- [x] 1.6 Create database user for developer Azure CLI access (SQL script)

## 2. Prisma Setup

- [x] 2.1 Install Prisma dependencies (`prisma`, `@prisma/client`, `@prisma/adapter-mssql`, `mssql`)
- [x] 2.2 Initialize Prisma with SQL Server provider (`npx prisma init --datasource-provider sqlserver`)
- [x] 2.3 Configure `DATABASE_URL` with `ActiveDirectoryDefault` authentication
- [x] 2.4 Create Prisma schema with all entities (Client, Contact, Timesheet, Invoice, Settings)
- [x] 2.5 Configure Prisma MSSQL adapter for Prisma 7.x (required for direct database connections)

## 3. Database Schema

- [x] 3.1 Define Client model with JSON fields for recipient arrays
- [x] 3.2 Define Contact model with relation to Client
- [x] 3.3 Define Timesheet model with relation to Client and status enum
- [x] 3.4 Define Invoice model with relations to Client and Timesheet
- [x] 3.5 Define Settings model with key-value JSON pattern
- [x] 3.6 Run initial migration (`npx prisma migrate dev --name init`)

## 4. Database Client Setup

- [x] 4.1 Create `src/lib/db/prisma.ts` with singleton PrismaClient instance
- [x] 4.2 Add connection error handling and Azure Entra ID adapter configuration
- [x] 4.3 Verify Azure CLI auth works locally (`az login` + test query)
- [x] 4.4 Test database connection

## 5. Repository Migration

- [x] 5.1 Create `src/lib/db/repositories/client.ts` with Prisma implementations
- [x] 5.2 Create `src/lib/db/repositories/timesheet.ts` with Prisma implementations
- [x] 5.3 Create `src/lib/db/repositories/invoice.ts` with Prisma implementations
- [x] 5.4 Create `src/lib/db/index.ts` to re-export all repository functions
- [x] 5.5 Update import paths to use new repositories

## 6. Settings Migration

- [x] 6.1 Create database-backed settings in `src/lib/settings/index.ts`
- [x] 6.2 Migrate `getHourlyRate` / `setHourlyRate` to use Settings table
- [x] 6.3 Migrate `getBusinessProfile` / `setBusinessProfile` to use Settings table
- [x] 6.4 Migrate `getAndIncrementNextInvoiceNumber` with transaction support
- [x] 6.5 Create `src/lib/settings/schemas.ts` for client-safe Zod schemas

## 7. API Route Updates

- [x] 7.1 Update `/api/clients` routes to await repository calls
- [x] 7.2 Update `/api/timesheets` routes to await repository calls
- [x] 7.3 Update `/api/settings` routes to await repository calls

## 8. Testing & Verification

- [x] 8.1 Update existing tests to work with async repository functions
- [x] 8.2 Add test utilities for database reset (test isolation)
- [x] 8.3 Create `src/test/mock-prisma.ts` for in-memory Prisma mock
- [x] 8.4 Verify all CRUD operations work end-to-end (via unit tests with mock)
- [x] 8.5 All 99 tests passing
- [x] 8.6 Test connection handling and error cases
- [x] 8.7 Verify managed identity auth works in deployed App Service

## 9. Documentation & Cleanup

- [x] 9.1 Update `.env.example` with `DATABASE_URL` template (ActiveDirectoryDefault)
- [x] 9.2 Document local dev setup (Azure CLI install, `az login`, database user creation)
- [x] 9.3 Remove old in-memory mock data code
- [x] 9.4 Update CLAUDE.md with Prisma commands and database references

## Summary

All tasks complete:
- Azure SQL Database provisioned with Entra ID authentication
- Prisma schema created with all entities
- MSSQL adapter configured for Azure Entra ID authentication
- Repository layer implemented with proper type transformations
- Settings migrated to database-backed storage
- All API routes updated for async operations
- 99 tests passing with in-memory Prisma mock
- Build succeeds
- Documentation updated (README.md, CLAUDE.md)
- Old mock-data.ts removed
