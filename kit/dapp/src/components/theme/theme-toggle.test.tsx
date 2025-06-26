import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./theme-toggle";

// Mock next-themes
const mockSetTheme = mock(() => {
  // Mock setTheme function
});
void mock.module("next-themes", () => ({
  useTheme: mock(() => ({
    theme: "light",
    setTheme: mockSetTheme,
  })),
}));

// Mock react-i18next
void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

// Mock UI components
void mock.module("@kit/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

void mock.module("@kit/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="dropdown-item">
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconMoon: ({ className }: { className?: string }) => (
    <span className={className}>🌙</span>
  ),
  IconSun: ({ className }: { className?: string }) => (
    <span className={className}>☀️</span>
  ),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);

    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
  });

  it("shows sun icon when theme is light", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  it("shows moon icon when theme is dark", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    expect(screen.getByText("🌙")).toBeInTheDocument();
  });

  it("shows sun icon for system theme by default", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  it("renders all theme options", () => {
    render(<ThemeToggle />);

    const items = screen.getAllByTestId("dropdown-item");
    expect(items).toHaveLength(3);
    expect(screen.getByText("theme.light")).toBeInTheDocument();
    expect(screen.getByText("theme.dark")).toBeInTheDocument();
    expect(screen.getByText("theme.system")).toBeInTheDocument();
  });

  it("handles light theme selection", async () => {
    render(<ThemeToggle />);

    const lightOption = screen.getByText("theme.light").parentElement;
    const user = userEvent.setup();

    if (lightOption) {
      await user.click(lightOption);
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    }
  });

  it("handles dark theme selection", async () => {
    render(<ThemeToggle />);

    const darkOption = screen.getByText("theme.dark").parentElement;
    const user = userEvent.setup();

    if (darkOption) {
      await user.click(darkOption);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    }
  });

  it("handles system theme selection", async () => {
    render(<ThemeToggle />);

    const systemOption = screen.getByText("theme.system").parentElement;
    const user = userEvent.setup();

    if (systemOption) {
      await user.click(systemOption);
      expect(mockSetTheme).toHaveBeenCalledWith("system");
    }
  });

  it("applies custom className", () => {
    render(<ThemeToggle className="custom-theme-toggle" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-theme-toggle");
  });

  it("applies variant prop", () => {
    render(<ThemeToggle variant="ghost" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("variant", "ghost");
  });

  it("applies size prop", () => {
    render(<ThemeToggle size="sm" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("size", "sm");
  });

  it("has correct accessibility label", () => {
    render(<ThemeToggle />);

    const button = screen.getByLabelText("theme.toggle");
    expect(button).toBeInTheDocument();
  });

  it("applies icon rotation animation", () => {
    render(<ThemeToggle />);

    const icon = screen.getByText("☀️");
    expect(icon).toHaveClass("rotate-0", "scale-100", "transition-all");
  });

  it("handles icon transition between themes", async () => {
    const { useTheme } = await import("next-themes");
    const { rerender } = render(<ThemeToggle />);

    // Light theme
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });
    rerender(<ThemeToggle />);

    const sunIcon = screen.getByText("☀️");
    expect(sunIcon).toHaveClass("rotate-0", "scale-100");

    // Dark theme
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });
    rerender(<ThemeToggle />);

    const moonIcon = screen.getByText("🌙");
    expect(moonIcon).toHaveClass("rotate-0", "scale-100");
  });

  it("renders with default props when none provided", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("variant", "outline");
    expect(button).toHaveAttribute("size", "icon");
  });

  it("maintains consistent dropdown alignment", () => {
    render(<ThemeToggle />);

    const dropdownContent = screen.getByTestId("dropdown-content");
    expect(dropdownContent).toBeInTheDocument();
  });

  it("handles undefined theme gracefully", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    // Should show sun icon as default
    expect(screen.getByText("☀️")).toBeInTheDocument();
  });
});
