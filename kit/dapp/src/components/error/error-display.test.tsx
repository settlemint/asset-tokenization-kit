import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorCodeDisplay, ErrorDisplay } from "./error-display";

// Mock dependencies
void mock.module("@tanstack/react-router", () => ({
  useRouter: mock(() => ({
    history: {
      back: mock(() => {
        // Mock back function
      }),
    },
  })),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

describe("ErrorCodeDisplay", () => {
  it("renders error code correctly", () => {
    render(<ErrorCodeDisplay errorCode="404" />);

    const errorCode = screen.getByText("404");
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass("text-9xl", "font-bold");
  });

  it("renders numeric error code", () => {
    render(<ErrorCodeDisplay errorCode={500} />);

    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("applies default styling", () => {
    render(<ErrorCodeDisplay errorCode="403" />);

    const container = screen.getByText("403").closest("div");
    expect(container).toHaveClass(
      "absolute",
      "inset-0",
      "flex",
      "items-center",
      "justify-center"
    );
  });
});

describe("ErrorDisplay", () => {
  const defaultProps = {
    title: "Error Title",
    description: "Error Description",
    errorCode: "500",
  };

  it("renders all error information", () => {
    render(<ErrorDisplay {...defaultProps} />);

    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error Description")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders with default values when props are missing", () => {
    render(<ErrorDisplay />);

    expect(screen.getByText("error.genericError")).toBeInTheDocument();
    expect(screen.getByText("error.genericErrorMessage")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", async () => {
    const mockRetry = mock(() => {
      // Mock retry function
    });
    render(<ErrorDisplay {...defaultProps} onRetry={mockRetry} showRetry />);

    const retryButton = screen.getByText("error.tryAgain");
    expect(retryButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(retryButton);

    expect(mockRetry).toHaveBeenCalled();
  });

  it("hides retry button when showRetry is false", () => {
    const mockRetry = mock(() => {
      // Mock retry function
    });
    render(
      <ErrorDisplay {...defaultProps} onRetry={mockRetry} showRetry={false} />
    );

    expect(screen.queryByText("error.tryAgain")).not.toBeInTheDocument();
  });

  it("shows go back button when enabled", async () => {
    const { useRouter } = await import("@tanstack/react-router");
    const mockBack = mock(() => {
      // Mock back function
    });
    (useRouter as ReturnType<typeof mock>).mockReturnValue({
      history: { back: mockBack },
    });

    render(<ErrorDisplay {...defaultProps} showGoBack />);

    const goBackButton = screen.getByText("error.goBack");
    expect(goBackButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(goBackButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("shows home button when enabled", () => {
    render(<ErrorDisplay {...defaultProps} showHome />);

    const homeLink = screen.getByText("error.home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders multiple action buttons correctly", () => {
    render(
      <ErrorDisplay
        {...defaultProps}
        onRetry={mock(() => {
          // Mock retry function
        })}
        showRetry
        showGoBack
        showHome
      />
    );

    expect(screen.getByText("error.tryAgain")).toBeInTheDocument();
    expect(screen.getByText("error.goBack")).toBeInTheDocument();
    expect(screen.getByText("error.home")).toBeInTheDocument();
  });

  it("applies correct layout styling", () => {
    render(<ErrorDisplay {...defaultProps} />);

    const container = screen.getByText("Error Title").closest("div.relative");
    expect(container).toHaveClass("relative", "z-10", "flex", "min-h-[100vh]");
  });

  it("renders icon correctly", () => {
    render(<ErrorDisplay {...defaultProps} />);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass("mx-auto", "h-16", "w-16");
  });
});
