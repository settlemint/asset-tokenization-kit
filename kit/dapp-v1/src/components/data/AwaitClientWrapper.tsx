"use client";

import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Error fallback component that renders a ReactNode.
 * Used when the error prop is provided as a ReactNode instead of a component.
 */
function ReactNodeErrorFallback({
  reactNode,
}: {
  reactNode: ReactNode;
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return <>{reactNode}</>;
}

/**
 * Default error fallback component with retry functionality.
 */
function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
      <p className="mb-4 text-center text-sm text-destructive">
        {error.message || "An error occurred while loading data"}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * A static client component that handles ReactNode error fallbacks.
 * This avoids the need to create functions dynamically in server components.
 */
function ReactNodeFallbackComponent({
  reactNode,
  error,
  resetErrorBoundary,
}: {
  reactNode: ReactNode;
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <ReactNodeErrorFallback
      reactNode={reactNode}
      error={error}
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}

/**
 * Client-side wrapper for handling error boundaries with React Query hydration.
 * This component handles the ErrorBoundary setup on the client side to avoid
 * server/client component boundary issues with function passing.
 */
export function AwaitClientWrapper({
  children,
  dehydratedState,
  error,
  fallback,
  resetKeys,
  errorFallbackComponent,
}: {
  children: ReactNode;
  dehydratedState: any;
  error?: ReactNode;
  fallback?: ReactNode;
  resetKeys?: (string | number)[];
  errorFallbackComponent?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}) {
  const shouldUseErrorBoundary = !!(error || errorFallbackComponent);

  if (shouldUseErrorBoundary) {
    const FallbackComponent =
      errorFallbackComponent ||
      (error
        ? ({
            error: err,
            resetErrorBoundary,
          }: {
            error: Error;
            resetErrorBoundary: () => void;
          }) => (
            <ReactNodeFallbackComponent
              reactNode={error}
              error={err}
              resetErrorBoundary={resetErrorBoundary}
            />
          )
        : DefaultErrorFallback);

    return (
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        resetKeys={resetKeys}
      >
        <HydrationBoundary state={dehydratedState}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </HydrationBoundary>
      </ErrorBoundary>
    );
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </HydrationBoundary>
  );
}
