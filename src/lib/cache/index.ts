/**
 * Simple in-memory cache with TTL support
 * Designed for server-side use in Azure App Service (persistent Node.js process)
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export interface CacheResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: Date;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get<T>(key: string): CacheResult<T> | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isStale = now >= entry.expiresAt;

    return {
      data: entry.data,
      isStale,
      cachedAt: new Date(entry.cachedAt),
    };
  }

  /**
   * Set a cached value with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  /**
   * Get cached value or fetch fresh data
   * Returns stale data if fetch fails and stale data exists
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<CacheResult<T>> {
    const cached = this.get<T>(key);

    // Return fresh cached data
    if (cached && !cached.isStale) {
      return cached;
    }

    // Try to fetch fresh data
    try {
      const data = await fetcher();
      this.set(key, data, ttlSeconds);
      return {
        data,
        isStale: false,
        cachedAt: new Date(),
      };
    } catch (error) {
      // Return stale data if available
      if (cached) {
        console.warn(
          `Cache fetch failed for key "${key}", returning stale data:`,
          error
        );
        return {
          ...cached,
          isStale: true,
        };
      }
      // No cached data to fall back on
      throw error;
    }
  }

  /**
   * Clear a specific cache key
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.store.clear();
  }
}

// Singleton instance for server-side use
export const cache = new MemoryCache();
