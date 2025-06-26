import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { NotFound } from "./not-found";

// Mock dependencies
void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

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

describe("NotFound", () => {
  it("renders default 404 error when no children provided", () => {
    render(<NotFound />);

    expect(screen.getByText("error.pageNotFound")).toBeInTheDocument();
    expect(screen.getByText("error.pageNotFoundMessage")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders custom children when provided", () => {
    const customContent = (
      <div>
        <h1>Custom 404 Title</h1>
        <p>Custom error message</p>
      </div>
    );

    render(<NotFound>{customContent}</NotFound>);

    expect(screen.getByText("Custom 404 Title")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();

    // Should not render default content
    expect(screen.queryByText("error.pageNotFound")).not.toBeInTheDocument();
  });

  it("shows go back and home buttons in default error", () => {
    render(<NotFound />);

    expect(screen.getByText("error.goBack")).toBeInTheDocument();
    expect(screen.getByText("error.home")).toBeInTheDocument();
  });

  it("renders with proper error code display", () => {
    render(<NotFound />);

    const errorCode = screen.getByText("404");
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass("text-9xl");
  });

  it("does not render error display when children are provided", () => {
    render(
      <NotFound>
        <div>Custom content</div>
      </NotFound>
    );

    // Should not have the error code display
    expect(screen.queryByText("404")).not.toBeInTheDocument();
    expect(screen.queryByText("error.goBack")).not.toBeInTheDocument();
  });

  it("maintains consistent structure with fragment wrapper", () => {
    const { container } = render(<NotFound />);

    // Check that content is properly wrapped
    const errorDisplay = container.querySelector("div.relative.z-10");
    expect(errorDisplay).toBeInTheDocument();
  });

  it("renders children with full flexibility", () => {
    render(
      <NotFound>
        <div data-testid="custom-wrapper">
          <span data-testid="custom-span">Test</span>
          <button type="button">Custom Button</button>
        </div>
      </NotFound>
    );

    expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("custom-span")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Custom Button" })
    ).toBeInTheDocument();
  });
});
