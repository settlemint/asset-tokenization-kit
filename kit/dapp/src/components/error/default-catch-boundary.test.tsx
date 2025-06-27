import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DefaultCatchBoundary } from "./default-catch-boundary";
import type { ErrorComponentProps } from "@tanstack/react-router";

// Mock dependencies
void mock.module("@tanstack/react-router", () => ({
  useRouter: mock(() => ({
    invalidate: mock(() => Promise.resolve()),
  })),
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

describe("DefaultCatchBoundary", () => {
  const mockError: ErrorComponentProps = {
    error: new Error("Test error message"),
    info: {
      componentStack: "Component stack trace",
    },
    reset: mock(() => {
      // Mock reset function
    }),
  };

  it("renders error information correctly", () => {
    render(<DefaultCatchBoundary {...mockError} />);

    expect(screen.getByText("error.genericError")).toBeInTheDocument();
    expect(screen.getByText("error.genericErrorMessage")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("displays custom error message when available", () => {
    const customError = {
      ...mockError,
      error: Object.assign(new Error(), mockError.error, {
        message: "Custom error occurred",
      }),
    };

    render(<DefaultCatchBoundary {...customError} />);

    expect(screen.getByText("Custom error occurred")).toBeInTheDocument();
  });

  it("shows retry button and handles click", async () => {
    const { useRouter } = await import("@tanstack/react-router");
    const mockInvalidate = mock(() => Promise.resolve());
    (useRouter as ReturnType<typeof mock>).mockReturnValue({
      invalidate: mockInvalidate,
    });

    render(<DefaultCatchBoundary {...mockError} />);

    const retryButton = screen.getByText("error.tryAgain");
    expect(retryButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(retryButton);

    expect(mockInvalidate).toHaveBeenCalled();
  });

  it("renders with proper error code display", () => {
    render(<DefaultCatchBoundary {...mockError} />);

    const errorCodeDisplay = screen.getByText("500");
    expect(errorCodeDisplay).toHaveClass("text-9xl");
    expect(errorCodeDisplay.closest("div")).toHaveClass("opacity-5");
  });

  it("handles errors without message gracefully", () => {
    const errorWithoutMessage = {
      ...mockError,
      error: new Error(),
    };

    render(<DefaultCatchBoundary {...errorWithoutMessage} />);

    expect(screen.getByText("error.genericErrorMessage")).toBeInTheDocument();
  });

  it("applies correct styling and layout", () => {
    render(<DefaultCatchBoundary {...mockError} />);

    const container = screen.getByText("error.genericError").closest("div");
    expect(container).toHaveClass(
      "min-h-[100vh]",
      "flex",
      "items-center",
      "justify-center"
    );
  });
});
