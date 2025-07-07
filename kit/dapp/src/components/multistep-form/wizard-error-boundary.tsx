import { Component, type ReactNode, type ComponentType, type FC } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

class WizardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging with more details
    logger.error("MultiStepWizard error boundary caught error", {
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        toString: error?.toString(),
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack,
      },
    });

    // Also log to console for immediate debugging
    console.error("MultiStepWizard Error Boundary:", {
      error,
      errorInfo,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override async render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              An error occurred while rendering the wizard. Please try again.
            </p>
            <p className="text-xs opacity-75 mb-4 font-mono">
              {this.state.error.message}
            </p>
            <Button variant="outline" size="sm" onClick={this.reset}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export function withWizardErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
): FC<P> {
  const WrappedComponent: FC<P> = (props) => (
    <WizardErrorBoundary fallback={fallback}>
      <Component {...props} />
    </WizardErrorBoundary>
  );

  WrappedComponent.displayName = `withWizardErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

export { WizardErrorBoundary };
