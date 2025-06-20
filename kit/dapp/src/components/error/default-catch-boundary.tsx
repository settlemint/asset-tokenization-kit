/**
 * Default Error Boundary Component
 *
 * This module provides a catch-all error boundary for the application that handles
 * uncaught errors and exceptions during rendering. It displays error details and
 * provides recovery options to users, helping maintain a good user experience even
 * when things go wrong.
 *
 * The component integrates with TanStack Router to provide navigation-aware error
 * handling, adjusting the recovery options based on the current route context.
 *
 * @see {@link https://tanstack.com/router/latest/docs/guide/error-boundaries} - TanStack Router error boundaries
 */

import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";

/**
 * Default catch boundary component for handling runtime errors.
 *
 * This component serves as the application's error boundary, catching and displaying
 * errors that occur during component rendering or data loading. It provides:
 *
 * - Visual error display using TanStack Router's ErrorComponent
 * - Console logging for debugging purposes
 * - Recovery options that adapt based on route context
 * - Graceful error handling to prevent complete application crashes
 *
 * The component checks if the error occurred at the root route and adjusts the
 * navigation options accordingly:
 * - Root route errors: Shows "Home" link for navigation
 * - Non-root errors: Shows "Go Back" link using browser history
 *
 * @param error - The error object containing error details from TanStack Router
 *
 * @example
 * ```tsx
 * // This component is typically used in route configurations
 * export const Route = createFileRoute('/')({
 *   errorComponent: DefaultCatchBoundary,
 *   component: MyComponent,
 * })
 * ```
 */
export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();

  /**
   * Check if the error occurred at the root route.
   * This determines which navigation options to show the user.
   */
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  // Log error to console for debugging
  console.error(error);

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => {
            void router.invalidate();
          }}
          className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`}
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`}
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
