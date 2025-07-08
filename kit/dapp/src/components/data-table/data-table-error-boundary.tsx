"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { ComponentType, ErrorInfo, ReactNode } from "react";
import { Component } from "react";

const logger = createLogger({
  level: env.VITE_SETTLEMINT_LOG_LEVEL,
});

/**
 * Props for the DataTableErrorBoundary component
 */
interface DataTableErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional custom error component */
  fallback?: ComponentType<ErrorBoundaryState>;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional table name for better error context */
  tableName?: string;
}

/**
 * State for the error boundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  tableName,
}: ErrorBoundaryState & {
  onReset: () => void;
  tableName?: string;
}) {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center rounded-xl bg-card p-8 text-card-foreground shadow-sm">
      <div className="flex max-w-md flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {tableName
              ? `Error loading ${tableName} table`
              : "Error loading table"}
          </h3>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while rendering the data table. The
            table data might be corrupted or there could be a temporary issue.
          </p>
          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-4 rounded-md bg-muted p-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                {error.message}
                {errorInfo?.componentStack && (
                  <>
                    {"\n\nComponent Stack:"}
                    {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
        <Button onClick={onReset} variant="default" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

/**
 * Error boundary component for DataTable
 * Catches rendering errors and provides a user-friendly fallback UI
 */
export class DataTableErrorBoundary extends Component<
  DataTableErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DataTableErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, tableName } = this.props;

    // Log the error with context
    logger.error("DataTable rendering error", {
      error: error.message,
      tableName,
      componentStack: errorInfo.componentStack,
      errorStack: error.stack,
    });

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, tableName } = this.props;

      if (FallbackComponent) {
        return <FallbackComponent {...this.state} />;
      }

      return (
        <DefaultErrorFallback
          {...this.state}
          onReset={this.handleReset}
          tableName={tableName}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with DataTable error boundary
 */
export function withDataTableErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<DataTableErrorBoundaryProps, "children">
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <DataTableErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </DataTableErrorBoundary>
  );

  const componentName =
    Component.displayName ?? (Component.name || "Component");
  WrappedComponent.displayName = `withDataTableErrorBoundary(${componentName})`;

  return WrappedComponent;
}
