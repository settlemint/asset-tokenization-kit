import { useEffect, useState } from "react";

/**
 * Hook to determine if a component is mounted
 *
 * This hook is useful for preventing hydration mismatches in SSR/SSG applications
 * by ensuring certain client-only code doesn't run until after the component has
 * mounted in the browser.
 *
 * Common use cases:
 * - Rendering components that depend on browser APIs
 * - Displaying client-specific content that differs from server-rendered content
 * - Preventing flash of incorrect content during hydration
 *
 * @returns {boolean} `true` if the component is mounted, `false` during SSR/initial render
 *
 * @example
 * ```tsx
 * function ClientOnlyComponent() {
 *   const mounted = useMounted();
 *
 *   if (!mounted) {
 *     return <div>Loading...</div>; // Placeholder during SSR
 *   }
 *
 *   // Client-only code that uses window, document, etc.
 *   return <div>{window.location.href}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Preventing hydration mismatches with dynamic content
 * function DynamicTime() {
 *   const mounted = useMounted();
 *
 *   return (
 *     <time>
 *       {mounted ? new Date().toLocaleTimeString() : 'Loading...'}
 *     </time>
 *   );
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
