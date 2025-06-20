/**
 * Cache Management Utilities
 *
 * Provides utilities for managing and clearing various caches
 * used by the application, particularly useful during development
 * when data structures change.
 */

/**
 * Clears all application caches.
 *
 * This includes:
 * - TanStack Query cache in localStorage
 * - Any other localStorage items prefixed with 'atk-'
 * - Session storage if needed
 *
 * @example
 * ```typescript
 * // Clear cache on development hot reload
 * if (import.meta.hot) {
 *   import.meta.hot.on('vite:beforeUpdate', () => {
 *     clearAllCaches();
 *   });
 * }
 * ```
 */
export function clearAllCaches() {
  if (typeof window === "undefined") return;

  // Clear TanStack Query cache
  localStorage.removeItem("atk-query-cache");

  // Clear any other app-specific localStorage items
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("atk-")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Also clear sessionStorage if needed
  sessionStorage.clear();

  console.log("[Cache] All caches cleared");
}

/**
 * Clears only the TanStack Query cache.
 */
export function clearQueryCache() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("atk-query-cache");
  console.log("[Cache] Query cache cleared");
}

/**
 * Checks if the cache should be cleared based on build ID mismatch.
 * This is useful for automatic cache busting on new deployments.
 *
 * @param currentBuildId - The current build ID
 * @returns true if cache was cleared, false otherwise
 */
export function checkAndClearStaleCache(currentBuildId: string): boolean {
  if (typeof window === "undefined") return false;

  const STORAGE_KEY = "atk-build-id";
  const storedBuildId = localStorage.getItem(STORAGE_KEY);

  if (storedBuildId !== currentBuildId) {
    clearAllCaches();
    localStorage.setItem(STORAGE_KEY, currentBuildId);
    console.log(
      `[Cache] Cleared due to build ID change: ${storedBuildId} -> ${currentBuildId}`
    );
    return true;
  }

  return false;
}

/**
 * Development-only cache management.
 * Provides convenient cache clearing during development.
 */
export function setupDevCacheManagement() {
  if (process.env.NODE_ENV !== "development") return;

  // Add global function for easy console access
  if (typeof window !== "undefined") {
    // Use a more specific type for the global window object
    interface DevWindow extends Window {
      clearCache?: () => void;
    }

    (window as DevWindow).clearCache = () => {
      clearAllCaches();
      window.location.reload();
    };

    console.log("[Dev] Cache utilities available:");
    console.log("- clearCache() - Clear all caches and reload");
  }

  // Clear cache on Vite HMR if needed
  if (import.meta.hot) {
    // You can uncomment this to clear cache on every HMR update
    // import.meta.hot.on('vite:beforeUpdate', () => {
    //   clearQueryCache();
    // });
  }
}
