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
 * - Broadcasts cache clear event to other tabs
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

  // Broadcast cache clear event to other tabs
  // This ensures all tabs clear their in-memory caches too
  try {
    const bc = new BroadcastChannel("atk-cache-clear");
    bc.postMessage({ type: "clear-all-caches" });
    bc.close();
  } catch {
    // BroadcastChannel might not be supported in all browsers
    console.warn("[Cache] BroadcastChannel not supported");
  }

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

  const BUILD_ID_KEY = "atk-build-id";
  const storedBuildId = localStorage.getItem(BUILD_ID_KEY);
  
  // Check if build ID changed (for production deployments)
  if (storedBuildId !== currentBuildId) {
    clearAllCaches();
    localStorage.setItem(BUILD_ID_KEY, currentBuildId);
    console.log(
      `[Cache] Cleared due to build ID change: ${storedBuildId} -> ${currentBuildId}`
    );
    return true;
  }

  return false;
}

/**
 * Checks for dev reset marker and clears cache if needed.
 * This is separated from checkAndClearStaleCache to handle async operations properly.
 * 
 * @returns Promise that resolves to true if cache was cleared and page will reload
 */
export async function checkDevResetMarker(): Promise<boolean> {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return false;
  }

  const RESET_MARKER_KEY = "atk-last-reset";
  const lastResetCheck = localStorage.getItem(RESET_MARKER_KEY);

  try {
    const response = await fetch("/.dev-reset-marker");
    const resetTimestamp = await response.text();
    const trimmedTimestamp = resetTimestamp.trim();
    
    if (trimmedTimestamp && trimmedTimestamp !== lastResetCheck) {
      clearAllCaches();
      localStorage.setItem(RESET_MARKER_KEY, trimmedTimestamp);
      console.log(
        `[Cache] Cleared due to fresh dev environment at: ${trimmedTimestamp}`
      );
      // Schedule reload after a short delay to ensure all operations complete
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return true;
    }
  } catch {
    // Marker file doesn't exist or can't be read, which is fine
    // This happens on first run or if the file hasn't been created yet
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

    // Listen for cache clear events from other tabs
    try {
      const bc = new BroadcastChannel("atk-cache-clear");
      bc.onmessage = (event) => {
        if (event.data?.type === "clear-all-caches") {
          console.log("[Cache] Received cache clear event from another tab");
          // Clear in-memory query cache
          void import("../query.client").then(({ queryClient }) => {
            queryClient.clear();
            console.log("[Cache] In-memory query cache cleared");
          });
        }
      };
    } catch {
      // BroadcastChannel might not be supported
    }
  }

  // Clear cache on Vite HMR if needed
  if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
      clearQueryCache();
    });
  }
}
