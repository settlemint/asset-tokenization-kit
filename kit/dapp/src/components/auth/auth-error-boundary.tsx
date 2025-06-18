import { useNavigate } from "@tanstack/react-router";
import { Component, type PropsWithChildren, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AuthErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode;
}

export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error) {
    // Check if this is an authentication error from ORPC
    // ORPC errors have a code property when they're authentication errors
    if ('code' in error && error.code === "UNAUTHORIZED") {
      // Clear any stale auth data and redirect to sign-in
      window.location.href = "/auth/signin";
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default fallback - this will show briefly before redirect
      return null;
    }

    return this.props.children;
  }
}

// Hook-based wrapper for functional components
export function useAuthErrorBoundary() {
  const navigate = useNavigate();

  return {
    handleAuthError: (error: unknown) => {
      const errorObj = error as { code?: string };
      if (errorObj.code === "UNAUTHORIZED") {
        void navigate({ to: "/auth/$pathname", params: { pathname: "signin" }, replace: true });
      }
    },
  };
}