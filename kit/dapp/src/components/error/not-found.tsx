/**
 * Not Found Component
 *
 * This module provides a 404 error page component that displays when users navigate
 * to non-existent routes or resources. It offers a user-friendly message and
 * navigation options to help users recover from navigation errors.
 *
 * The component is designed to be flexible, allowing custom error messages while
 * providing sensible defaults for common 404 scenarios.
 * @see {@link https://tanstack.com/router/latest/docs/guide/not-found-errors} - TanStack Router not found handling
 */

import { ErrorDisplay, ErrorCodeDisplay } from "@/components/ui/error-display";
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
 * @param {object} props - The component props
 * @param {import("react").ReactNode} [props.children] - Optional custom error message or content to display.
 *                                       If not provided, displays a default "page not found" message.
 * @returns {JSX.Element} A React component that displays the 404 error page UI
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
  // If children is provided as a string, use it as the description
  // If children is a ReactNode (JSX), render it directly in the ErrorDisplay
  // If no children, use the default message
  const defaultDescription = "The page you are looking for does not exist.";
  const description =
    typeof children === "string"
      ? children
      : children
        ? undefined
        : defaultDescription;

  return (
    <div className="relative flex flex-col w-full justify-center min-h-[50vh] p-6 md:p-10">
      <div className="relative max-w-5xl mx-auto w-full">
        <ErrorCodeDisplay errorCode="404" />
        <ErrorDisplay
          title="Page not found"
          description={description ?? defaultDescription}
          errorCode="404"
          showRetry={false}
        />
        {/* Render non-string children as custom content below the error display */}
        {children && typeof children !== "string" && (
          <div className="mt-6 text-center">{children}</div>
        )}
      </div>
    </div>
  );
}
