import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cache } from './index'

describe('cache', () => {
  beforeEach(() => {
    cache.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getOrFetch', () => {
    it('stores and retrieves values', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await cache.getOrFetch('test-key', fetcher, 60)

      expect(result.data).toEqual({ data: 'test' })
      expect(result.isStale).toBe(false)
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('returns cached value without calling fetcher again', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.getOrFetch('test-key', fetcher, 60)
      const result = await cache.getOrFetch('test-key', fetcher, 60)

      expect(result.data).toEqual({ data: 'test' })
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('refetches after TTL expires', async () => {
      const fetcher = vi.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' })

      await cache.getOrFetch('test-key', fetcher, 60)

      // Advance time past TTL
      vi.advanceTimersByTime(61 * 1000)

      const result = await cache.getOrFetch('test-key', fetcher, 60)

      expect(result.data).toEqual({ data: 'second' })
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('returns stale data when fetch fails and cache exists', async () => {
      const fetcher = vi.fn()
        .mockResolvedValueOnce({ data: 'cached' })
        .mockRejectedValueOnce(new Error('Network error'))

      await cache.getOrFetch('test-key', fetcher, 60)

      // Advance time past TTL
      vi.advanceTimersByTime(61 * 1000)

      const result = await cache.getOrFetch('test-key', fetcher, 60)

      expect(result.data).toEqual({ data: 'cached' })
      expect(result.isStale).toBe(true)
    })

    it('throws when fetch fails and no cached data exists', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(cache.getOrFetch('test-key', fetcher, 60)).rejects.toThrow('Network error')
    })

    it('uses separate cache entries for different keys', async () => {
      const fetcher1 = vi.fn().mockResolvedValue({ data: 'value1' })
      const fetcher2 = vi.fn().mockResolvedValue({ data: 'value2' })

      await cache.getOrFetch('key1', fetcher1, 60)
      await cache.getOrFetch('key2', fetcher2, 60)

      const result1 = await cache.getOrFetch('key1', fetcher1, 60)
      const result2 = await cache.getOrFetch('key2', fetcher2, 60)

      expect(result1.data).toEqual({ data: 'value1' })
      expect(result2.data).toEqual({ data: 'value2' })
    })
  })

  describe('get', () => {
    it('returns null for non-existent key', () => {
      const result = cache.get('non-existent')
      expect(result).toBeNull()
    })

    it('marks data as stale after TTL expires', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      await cache.getOrFetch('test-key', fetcher, 60)

      // Advance time past TTL
      vi.advanceTimersByTime(61 * 1000)

      const result = cache.get('test-key')
      expect(result?.isStale).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes cached entry', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      await cache.getOrFetch('test-key', fetcher, 60)

      const deleted = cache.delete('test-key')

      expect(deleted).toBe(true)
      expect(cache.get('test-key')).toBeNull()
    })

    it('returns false for non-existent key', () => {
      const deleted = cache.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all cached entries', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })
      await cache.getOrFetch('key1', fetcher, 60)
      await cache.getOrFetch('key2', fetcher, 60)

      cache.clear()

      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })
})
