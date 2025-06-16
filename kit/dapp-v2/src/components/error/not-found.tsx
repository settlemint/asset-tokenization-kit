/**
 * Not Found Component
 * 
 * This module provides a 404 error page component that displays when users navigate
 * to non-existent routes or resources. It offers a user-friendly message and
 * navigation options to help users recover from navigation errors.
 * 
 * The component is designed to be flexible, allowing custom error messages while
 * providing sensible defaults for common 404 scenarios.
 * 
 * @see {@link https://tanstack.com/router/latest/docs/guide/not-found-errors} - TanStack Router not found handling
 */

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Not Found component for displaying 404 error pages.
 * 
 * This component renders a user-friendly 404 error page with:
 * - A customizable error message (or default message if not provided)
 * - Navigation options to help users find their way back
 * - Consistent styling that matches the application theme
 * 
 * The component provides two recovery options:
 * 1. "Go back" - Uses browser history to return to the previous page
 * 2. "Start Over" - Navigates to the application's home page
 * 
 * @param children - Optional custom error message or content to display.
 *                   If not provided, displays a default "page not found" message.
 * 
 * @example
 * ```tsx
 * // With default message
 * <NotFound />
 * 
 * // With custom message
 * <NotFound>
 *   <p>The asset you're looking for has been moved or deleted.</p>
 * </NotFound>
 * 
 * // In route configuration
 * export const Route = createFileRoute('/assets/$id')({
 *   notFoundComponent: () => <NotFound>Asset not found</NotFound>,
 * })
 * ```
 */
export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-gray-600 dark:text-gray-400">
        {children ?? <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            window.history.back();
          }}
          className="bg-emerald-500 text-white px-2 py-1 rounded uppercase font-black text-sm"
        >
          Go back
        </button>
        <Link
          to="/"
          className="bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm"
        >
          Start Over
        </Link>
      </p>
    </div>
  );
}
