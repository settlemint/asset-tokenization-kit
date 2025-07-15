/**
 * In-memory cache for interface support checks
 * This cache helps avoid repeated GraphQL queries for the same contract interfaces
 */

interface CacheEntry {
  value: boolean;
  timestamp: number;
}

export class InterfaceCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;

  constructor(ttlMinutes = 10) {
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Generate a cache key for a contract and interface combination
   */
  private getKey(contractAddress: string, interfaceId: string): string {
    return `${contractAddress.toLowerCase()}-${interfaceId}`;
  }

  /**
   * Get a value from the cache if it exists and hasn't expired
   */
  get(contractAddress: string, interfaceId: string): boolean | null {
    const key = this.getKey(contractAddress, interfaceId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(contractAddress: string, interfaceId: string, value: boolean): void {
    const key = this.getKey(contractAddress, interfaceId);
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired entries from the cache
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }
}

// Global singleton instance
export const interfaceCache = new InterfaceCache(10); // 10 minute TTL

// Clean up expired entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      interfaceCache.cleanExpired();
    },
    5 * 60 * 1000
  );
}
