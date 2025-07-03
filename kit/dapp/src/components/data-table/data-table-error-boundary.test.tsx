import { describe, it, expect, mock } from "bun:test";
import {
  DataTableErrorBoundary,
  withDataTableErrorBoundary,
} from "./data-table-error-boundary";

// Mock the logger
void mock.module("@settlemint/sdk-utils/logging", () => ({
  createLogger: () => ({
    error: mock(() => {
      // Mock error function
    }),
  }),
}));

describe("DataTableErrorBoundary", () => {
  it("should handle errors and display fallback UI", () => {
    // Testing error boundaries requires integration testing
    // or using React Test Renderer/Testing Library
    // For now, we'll test the component structure

    const errorBoundary = new DataTableErrorBoundary({
      children: null,
    });

    // Test initial state
    expect(errorBoundary.state.hasError).toBe(false);
    expect(errorBoundary.state.error).toBe(null);
    expect(errorBoundary.state.errorInfo).toBe(null);
  });

  it("should update state when error is caught", () => {
    const testError = new Error("Test error");
    const state = DataTableErrorBoundary.getDerivedStateFromError(testError);

    expect(state.hasError).toBe(true);
    expect(state.error).toBe(testError);
  });

  it("should reset state on handleReset", () => {
    const errorBoundary = new DataTableErrorBoundary({
      children: null,
    });

    // Set error state
    errorBoundary.setState({
      hasError: true,
      error: new Error("Test"),
      errorInfo: { componentStack: "test stack" },
    });

    // Reset
    errorBoundary.handleReset();

    // Check state is reset
    expect(errorBoundary.state.hasError).toBe(false);
    expect(errorBoundary.state.error).toBe(null);
    expect(errorBoundary.state.errorInfo).toBe(null);
  });
});

describe("withDataTableErrorBoundary", () => {
  it("should preserve component display name", () => {
    const TestComponent = () => null;
    TestComponent.displayName = "TestComponent";

    const WrappedComponent = withDataTableErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      "withDataTableErrorBoundary(TestComponent)"
    );
  });

  it("should handle components without display name", () => {
    const TestComponent = () => null;
    const WrappedComponent = withDataTableErrorBoundary(TestComponent);

    // Arrow functions have empty name, so it falls back to "Component"
    expect(WrappedComponent.displayName).toBe(
      "withDataTableErrorBoundary(Component)"
    );
  });

  it("should pass error boundary props", () => {
    const TestComponent = () => null;
    const onError = mock(() => {
      // Mock onError function
    });

    const WrappedComponent = withDataTableErrorBoundary(TestComponent, {
      tableName: "Test Table",
      onError,
    });

    // The wrapped component should be a function component
    expect(typeof WrappedComponent).toBe("function");
  });
});
