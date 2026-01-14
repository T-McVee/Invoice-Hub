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
