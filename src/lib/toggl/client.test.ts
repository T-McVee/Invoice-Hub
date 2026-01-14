import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock environment variables before importing the module
vi.stubEnv('TOGGL_API_TOKEN', 'test-token')
vi.stubEnv('TOGGL_WORKSPACE_ID', '12345')

// Import after env vars are set
import {
  fetchTimeEntries,
  fetchMonthToDateHours,
  fetchClients,
  verifyConnection,
} from './client'

describe('toggl/client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchTimeEntries', () => {
    it('calculates total hours correctly from entries', async () => {
      const mockEntries = [
        { id: 1, project_id: 123, duration: 3600, description: 'Task 1', start: '2024-01-15T09:00:00Z' },
        { id: 2, project_id: 123, duration: 1800, description: 'Task 2', start: '2024-01-15T14:00:00Z' },
        { id: 3, project_id: 123, duration: 5400, description: 'Task 3', start: '2024-01-16T10:00:00Z' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchTimeEntries('123', '2024-01')

      expect(result.totalSeconds).toBe(10800) // 3600 + 1800 + 5400
      expect(result.totalHours).toBe(3) // 10800 / 3600
      expect(result.entries).toHaveLength(3)
    })

    it('filters out entries from other projects', async () => {
      const mockEntries = [
        { id: 1, project_id: 123, duration: 3600, description: 'Task 1', start: '2024-01-15T09:00:00Z' },
        { id: 2, project_id: 456, duration: 7200, description: 'Other project', start: '2024-01-15T14:00:00Z' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchTimeEntries('123', '2024-01')

      expect(result.totalHours).toBe(1) // Only the 3600s entry
      expect(result.entries).toHaveLength(1)
    })

    it('excludes running entries (negative duration)', async () => {
      const mockEntries = [
        { id: 1, project_id: 123, duration: 3600, description: 'Done', start: '2024-01-15T09:00:00Z' },
        { id: 2, project_id: 123, duration: -1, description: 'Running', start: '2024-01-15T14:00:00Z' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchTimeEntries('123', '2024-01')

      expect(result.totalHours).toBe(1)
      expect(result.entries).toHaveLength(1)
    })

    it('handles entries with no description', async () => {
      const mockEntries = [
        { id: 1, project_id: 123, duration: 3600, description: '', start: '2024-01-15T09:00:00Z' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchTimeEntries('123', '2024-01')

      expect(result.entries[0].description).toBe('(no description)')
    })

    it('rounds hours to 2 decimal places', async () => {
      const mockEntries = [
        { id: 1, project_id: 123, duration: 4000, description: 'Task', start: '2024-01-15T09:00:00Z' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchTimeEntries('123', '2024-01')

      // 4000 / 3600 = 1.1111... should round to 1.11
      expect(result.totalHours).toBe(1.11)
    })

    it('throws error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      } as Response)

      await expect(fetchTimeEntries('123', '2024-01')).rejects.toThrow('Toggl API error: 401')
    })
  })

  describe('fetchMonthToDateHours', () => {
    it('sums all completed entries for current month', async () => {
      const mockEntries = [
        { id: 1, duration: 3600 },
        { id: 2, duration: 7200 },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchMonthToDateHours()

      expect(result.totalHours).toBe(3) // (3600 + 7200) / 3600
      expect(result.entryCount).toBe(2)
    })

    it('excludes running entries from MTD calculation', async () => {
      const mockEntries = [
        { id: 1, duration: 3600 },
        { id: 2, duration: -1 }, // running
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEntries),
      } as Response)

      const result = await fetchMonthToDateHours()

      expect(result.totalHours).toBe(1)
      expect(result.entryCount).toBe(1)
    })

    it('returns current month in YYYY-MM format', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)

      const result = await fetchMonthToDateHours()

      const now = new Date()
      const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      expect(result.month).toBe(expectedMonth)
    })
  })

  describe('fetchClients', () => {
    it('filters out archived clients', async () => {
      const mockClients = [
        { id: 1, wid: 12345, name: 'Active Client', archived: false, at: '2024-01-01' },
        { id: 2, wid: 12345, name: 'Archived Client', archived: true, at: '2024-01-01' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClients),
      } as Response)

      const result = await fetchClients()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Active Client')
    })
  })

  describe('verifyConnection', () => {
    it('returns success with email on valid credentials', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ email: 'test@example.com' }),
      } as Response)

      const result = await verifyConnection()

      expect(result.success).toBe(true)
      expect(result.email).toBe('test@example.com')
    })

    it('returns failure on invalid credentials', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)

      const result = await verifyConnection()

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP 401')
    })

    it('handles network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await verifyConnection()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })
})
