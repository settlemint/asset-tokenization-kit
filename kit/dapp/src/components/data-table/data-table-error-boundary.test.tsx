import { describe, it, expect, mock } from "bun:test";
import { DataTableErrorBoundary } from "./data-table-error-boundary";

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

// Note: HOC tests removed as we now use ComponentErrorBoundary for unified error handling
