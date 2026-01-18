/**
 * Prisma Client singleton for database access
 * Uses Azure Entra ID authentication via ActiveDirectoryDefault
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

// Parse DATABASE_URL into connection config
function parseConnectionConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse SQL Server connection string format:
  // sqlserver://server:port;database=name;authentication=ActiveDirectoryDefault;...
  const serverMatch = url.match(/sqlserver:\/\/([^:;]+)(?::(\d+))?/);
  const databaseMatch = url.match(/database=([^;]+)/);
  const authMatch = url.match(/authentication=([^;]+)/);
  const trustCertMatch = url.match(/trustServerCertificate=(true|false)/i);

  if (!serverMatch || !databaseMatch) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    server: serverMatch[1],
    port: serverMatch[2] ? parseInt(serverMatch[2], 10) : 1433,
    database: databaseMatch[1],
    authentication: authMatch ? authMatch[1] : 'ActiveDirectoryDefault',
    trustServerCertificate: trustCertMatch
      ? trustCertMatch[1].toLowerCase() === 'true'
      : false,
  };
}

// Create adapter with Azure Entra ID authentication
function createAdapter() {
  const config = parseConnectionConfig();

  return new PrismaMssql({
    server: config.server,
    port: config.port,
    database: config.database,
    options: {
      encrypt: true, // Required for Azure SQL
      trustServerCertificate: config.trustServerCertificate,
    },
    // Azure Entra ID authentication configuration
    authentication: {
      type: 'azure-active-directory-default',
      options: {},
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  });
}

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect from the database
 * Useful for cleanup in tests
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
