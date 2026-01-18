// Test setup file
// jest-dom matchers are loaded via environmentMatchGlobs for .tsx tests

import { vi, beforeEach } from 'vitest';

// Create mock Prisma client in hoisted scope (runs before any imports)
const { mockPrisma, clearMockData, resetMocks } = await vi.hoisted(async () => {
  const { mockPrisma, clearMockData, resetMocks } = await import('./mock-prisma');
  return { mockPrisma, clearMockData, resetMocks };
});

// Mock the generated Prisma client - must match exact import path used in source
vi.mock('../generated/prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock with path alias as well
vi.mock('@/generated/prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock the Prisma singleton module
vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
  disconnect: vi.fn(),
}));

// Also mock with relative path for any files that import relatively
vi.mock('../lib/db/prisma', () => ({
  prisma: mockPrisma,
  disconnect: vi.fn(),
}));

// Clear mock data before each test for isolation
beforeEach(() => {
  clearMockData();
  resetMocks();
});
