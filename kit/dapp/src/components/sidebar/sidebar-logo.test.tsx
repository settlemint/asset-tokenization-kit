import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { SidebarLogo } from "./sidebar-logo";

// Mock dependencies
void mock.module("../logo/logo", () => ({
  Logo: ({ variant, className }: { variant?: string; className?: string }) => (
    <div data-testid="logo" data-variant={variant} className={className}>
      Logo Component
    </div>
  ),
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

describe("SidebarLogo", () => {
  it("renders logo component", () => {
    render(<SidebarLogo />);

    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("renders with icon variant", () => {
    render(<SidebarLogo />);

    const logo = screen.getByTestId("logo");
    expect(logo).toHaveAttribute("data-variant", "icon");
  });

  it("renders company name", () => {
    render(<SidebarLogo />);

    expect(screen.getByText("sidebar.companyName")).toBeInTheDocument();
  });

  it("applies correct layout structure", () => {
    const { container } = render(<SidebarLogo />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      "flex",
      "items-center",
      "gap-2",
      "px-2",
      "py-4"
    );
  });

  it("applies correct styling to company name", () => {
    render(<SidebarLogo />);

    const companyName = screen.getByText("sidebar.companyName");
    expect(companyName).toHaveClass("text-lg", "font-semibold");
  });

  it("passes correct className to Logo component", () => {
    render(<SidebarLogo />);

    const logo = screen.getByTestId("logo");
    expect(logo).toHaveClass("size-8");
  });

  it("uses translation for company name", async () => {
    const { useTranslation } = await import("react-i18next");
    const mockT = mock((key: string) => {
      if (key === "sidebar.companyName") {
        return "My Company";
      }
      return key;
    });

    (useTranslation as ReturnType<typeof mock>).mockReturnValue({
      t: mockT,
    });

    render(<SidebarLogo />);

    expect(mockT).toHaveBeenCalledWith("sidebar.companyName");
    expect(screen.getByText("My Company")).toBeInTheDocument();
  });

  it("maintains consistent spacing", () => {
    const { container } = render(<SidebarLogo />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("gap-2");
  });

  it("centers items vertically", () => {
    const { container } = render(<SidebarLogo />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("items-center");
  });

  it("applies horizontal padding", () => {
    const { container } = render(<SidebarLogo />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("px-2");
  });

  it("applies vertical padding", () => {
    const { container } = render(<SidebarLogo />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("py-4");
  });

  it("renders as a cohesive unit", () => {
    const { container } = render(<SidebarLogo />);

    // Should have exactly 2 child elements (logo and text)
    const wrapper = container.firstChild as Element;
    expect(wrapper.children).toHaveLength(2);
  });
});
