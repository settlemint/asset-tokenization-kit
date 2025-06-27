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

import { createLogger, type LogLevel } from '@settlemint/sdk-utils/logging';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/logo/logo';
import { ErrorCodeDisplay, ErrorDisplay } from '@/components/ui/error-display';
import {
  getErrorCode,
  useErrorDescription,
  useErrorTitle,
} from '@/hooks/use-error-info';
import { cn } from '@/lib/utils';

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || 'info',
});

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
  const { t } = useTranslation('general');
  const router = useRouter();
  const errorTitle = useErrorTitle(error);
  const errorDescription = useErrorDescription(error);

  // Log error to console for debugging
  logger.error('Error in DefaultCatchBoundary:', { error });

  return (
    // Full-screen container with theme-aware background images
    <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
      {/* Application branding - top left corner */}
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
        <div className={cn('flex w-full items-center gap-3')}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Logo forcedColorMode="dark" variant="icon" />
          </div>
          <div className="flex flex-col text-foreground leading-none">
            <span className="font-bold text-lg text-primary-foreground">
              SettleMint
            </span>
            <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-primary-foreground text-sm leading-snug dark:text-foreground ">
              {t('appDescription')}
            </span>
          </div>
        </div>
      </div>

      {/* Centered content area for error display */}
      <div className="relative flex min-h-screen w-full flex-col justify-center p-6 md:p-10">
        <div className="relative mx-auto w-full max-w-5xl">
          <ErrorCodeDisplay errorCode={getErrorCode(error)} />
          <ErrorDisplay
            description={errorDescription}
            errorCode={getErrorCode(error)}
            onRetry={() => {
              router.invalidate();
            }}
            title={errorTitle}
          />
        </div>
      </div>
    </div>
  );
}
