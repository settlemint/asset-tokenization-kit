import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "./language-switcher";

type ButtonProps = {
  children: React.ReactNode;
  [key: string]: unknown;
};

// Mock i18next
const mockChangeLanguage = mock(() => Promise.resolve());
void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: mockChangeLanguage,
    },
  })),
}));

// Mock UI components
void mock.module("../ui/button", () => ({
  Button: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
}));

void mock.module("../ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
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
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
  });

  it("renders language switcher button", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<LanguageSwitcher className="custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("applies variant and size props", () => {
    render(<LanguageSwitcher variant="outline" size="sm" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("variant", "outline");
    expect(button).toHaveAttribute("size", "sm");
  });

  it("displays current language code", async () => {
    const { useTranslation } = await import("react-i18next");
    (useTranslation as ReturnType<typeof mock>).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: "de",
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageSwitcher />);

    expect(screen.getByText("DE")).toBeInTheDocument();
  });

  it("renders all language options", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText("language.selectLanguage")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("العربية")).toBeInTheDocument();
    expect(screen.getByText("日本語")).toBeInTheDocument();
  });

  it("handles language change", async () => {
    render(<LanguageSwitcher />);

    const germanOption = screen.getAllByTestId("dropdown-item")[1]; // Deutsch
    const user = userEvent.setup();
    await user.click(germanOption!);

    expect(mockChangeLanguage).toHaveBeenCalledWith("de");
  });

  it("shows loading state during language change", async () => {
    mockChangeLanguage.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LanguageSwitcher />);

    const englishOption = screen.getAllByTestId("dropdown-item")[0];
    const user = userEvent.setup();
    await user.click(englishOption);

    // Should be disabled during loading
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("handles language change error gracefully", async () => {
    mockChangeLanguage.mockRejectedValueOnce(
      new Error("Language change failed")
    );

    render(<LanguageSwitcher />);

    const japaneseOption = screen.getAllByTestId("dropdown-item")[3];
    const user = userEvent.setup();
    await user.click(japaneseOption);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  it("displays flag icons for languages", () => {
    render(<LanguageSwitcher />);

    const items = screen.getAllByTestId("dropdown-item");

    // Check that each language has its flag
    expect(items[0]).toHaveTextContent("🇬🇧");
    expect(items[1]).toHaveTextContent("🇩🇪");
    expect(items[2]).toHaveTextContent("🇸🇦");
    expect(items[3]).toHaveTextContent("🇯🇵");
  });

  it("displays current language name in button", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("changes button text based on current language", async () => {
    const { useTranslation } = await import("react-i18next");
    (useTranslation as ReturnType<typeof mock>).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: "ja",
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageSwitcher />);

    expect(screen.getByText("JA")).toBeInTheDocument();
  });

  it("renders globe icon in button", () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders dropdown separator", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByTestId("dropdown-separator")).toBeInTheDocument();
  });
});
