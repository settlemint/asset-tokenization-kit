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
 * @see {@link https://tanstack.com/router/latest/docs/guide/error-boundaries} - TanStack Router error boundaries
 */

import { ErrorCodeDisplay, ErrorDisplay } from "@/components/ui/error-display";
import {
  getErrorCode,
  useErrorDescription,
  useErrorTitle,
} from "@/hooks/use-error-info";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useCallback } from "react";

const logger = createLogger();

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
 * @param {object} props - The error component props from TanStack Router
 * @param {Error} props.error - The error object containing error details
 * @returns {JSX.Element} A React component that displays the error boundary UI
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
  const errorTitle = useErrorTitle(error);
  const errorDescription = useErrorDescription(error);

  // Log error for debugging
  logger.error("DefaultCatchBoundary error", error);

  const handleRetry = useCallback(() => {
    void router.invalidate();
  }, [router]);

  return (
    <div className="relative flex flex-col w-full justify-center min-h-screen p-6">
      <div className="relative max-w-5xl mx-auto w-full">
        <ErrorCodeDisplay errorCode={getErrorCode(error)} />
        <ErrorDisplay
          errorCode={getErrorCode(error)}
          title={errorTitle}
          description={errorDescription}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
