/**
 * Component Error Boundary
 *
 * A unified error boundary for component-level error handling. This should be used
 * to isolate errors within specific UI components without affecting the entire route.
 *
 * For route-level errors, use TanStack Start's errorComponent with DefaultCatchBoundary.
 *
 * @example
 * ```tsx
 * <ComponentErrorBoundary componentName="UserTable">
 *   <DataTable columns={columns} data={data} />
 * </ComponentErrorBoundary>
 * ```
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from "react";

const logger = createLogger();

interface ComponentErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional name of the component for better error context */
  componentName?: string;
  /** Optional custom error fallback */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default error fallback component using shadcn Alert
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  componentName,
}: ErrorBoundaryState & {
  onReset: () => void;
  componentName?: string;
}) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {componentName ? `Error in ${componentName}` : "Something went wrong"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">
          An unexpected error occurred. The component might be temporarily
          unavailable.
        </p>
        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-4 rounded-md bg-muted p-4">
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
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="press-effect"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Unified error boundary component for component-level error isolation
 */
class ComponentErrorBoundary extends Component<
  ComponentErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName } = this.props;

    // Log the error with context
    logger.error("Component error boundary caught error", {
      error: error.message,
      componentName,
      componentStack: errorInfo.componentStack,
      errorStack: error.stack,
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const { fallback, componentName } = this.props;

      if (fallback && this.state.error) {
        return fallback(this.state.error, this.handleReset);
      }

      return (
        <DefaultErrorFallback
          {...this.state}
          onReset={this.handleReset}
          componentName={componentName}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with a error boundary
 * @param ComponentInstance - The component to wrap
 * @returns The wrapped component as a function that accepts props
 */
export function withErrorBoundary<Props extends object>(
  ComponentInstance: ComponentType<Props>
) {
  const componentName = ComponentInstance.name;
  // Return a new component that renders the error boundary around the wrapped component
  return function WrappedWithErrorBoundary(props: Props) {
    return (
      <ComponentErrorBoundary componentName={componentName}>
        <ComponentInstance {...props} />
      </ComponentErrorBoundary>
    );
  };
}
