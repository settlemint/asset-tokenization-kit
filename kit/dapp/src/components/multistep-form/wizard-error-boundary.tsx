import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { AlertCircle } from "lucide-react";
import { Component, type ReactNode } from "react";

const logger = createLogger();

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
        name: error.name,
        message: error.message,
        stack: error.stack,
        toString: error.toString(),
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Also log for immediate debugging
    logger.error("MultiStepWizard Error Boundary", {
      error,
      errorInfo,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
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

export { WizardErrorBoundary };
