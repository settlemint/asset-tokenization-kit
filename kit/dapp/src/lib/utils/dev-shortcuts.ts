/**
 * Development Keyboard Shortcuts
 *
 * Provides convenient keyboard shortcuts for common development tasks.
 * Only active in development mode.
 */

import { clearAllCaches } from "./clear-cache";

/**
 * Sets up development keyboard shortcuts.
 *
 * Available shortcuts:
 * - Cmd/Ctrl + Shift + K: Clear all caches and reload
 * - Cmd/Ctrl + Shift + Q: Clear query cache only
 */
export function setupDevShortcuts() {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;

  document.addEventListener("keydown", (event) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;

    // Cmd/Ctrl + Shift + K: Clear all caches and reload
    if (modifierKey && event.shiftKey && event.key === "K") {
      event.preventDefault();
      console.log("[Dev] Clearing all caches...");
      clearAllCaches();
      window.location.reload();
    }

    // Cmd/Ctrl + Shift + Q: Clear query cache only (no reload)
    if (modifierKey && event.shiftKey && event.key === "Q") {
      event.preventDefault();
      console.log("[Dev] Clearing query cache...");
      localStorage.removeItem("atk-query-cache");
      // Invalidate all queries
      void import("../query.client").then(({ queryClient }) => {
        void queryClient.invalidateQueries();
        console.log("[Dev] Query cache cleared and queries invalidated");
      });
    }
  });

  // Log available shortcuts
  console.log("[Dev] Keyboard shortcuts available:");
  console.log("- Cmd/Ctrl + Shift + K: Clear all caches and reload");
  console.log(
    "- Cmd/Ctrl + Shift + Q: Clear query cache and invalidate queries"
  );
}
