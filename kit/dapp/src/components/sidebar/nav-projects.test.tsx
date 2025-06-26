import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { NavProjects } from "./nav-projects";
import type { LucideIcon } from "lucide-react";

// Mock icons
const MockIcon: LucideIcon = (() => <span>ProjectIcon</span>) as unknown as LucideIcon;

// Mock dependencies
void mock.module("@kit/ui/sidebar", () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  SidebarMenuAction: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  SidebarMenuButton: ({ children, tooltip, ...props }: { children: React.ReactNode; tooltip?: string; [key: string]: unknown }) => (
    <button title={tooltip} {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  useSidebar: mock(() => ({
    isMobile: false,
  })),
}));

void mock.module("@kit/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="dropdown-item">
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconFolder: () => <span>📁</span>,
  IconForward: () => <span>➡️</span>,
  IconMoreHorizontal: ({ className }: { className?: string }) => (
    <span className={className}>⋯</span>
  ),
  IconTrash: () => <span>🗑️</span>,
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

describe("NavProjects", () => {
  const defaultProjects = [
    {
      name: "Project Alpha",
      url: "/projects/alpha",
      icon: MockIcon,
    },
    {
      name: "Project Beta",
      url: "/projects/beta",
      icon: MockIcon,
    },
    {
      name: "Project Gamma",
      url: "/projects/gamma",
      icon: MockIcon,
    },
  ];

  it("renders project list correctly", () => {
    render(<NavProjects projects={defaultProjects} />);

    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
    expect(screen.getByText("Project Gamma")).toBeInTheDocument();
  });

  it("renders group label", () => {
    render(<NavProjects projects={defaultProjects} />);

    expect(screen.getByText("sidebar.tokens")).toBeInTheDocument();
  });

  it("renders project icons", () => {
    render(<NavProjects projects={defaultProjects} />);

    const icons = screen.getAllByText("ProjectIcon");
    expect(icons).toHaveLength(3);
  });

  it("renders dropdown menu for each project", () => {
    render(<NavProjects projects={defaultProjects} />);

    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    expect(dropdownTriggers).toHaveLength(3);
  });

  it("renders more icon in dropdown trigger", () => {
    render(<NavProjects projects={defaultProjects} />);

    const moreIcons = screen.getAllByText("⋯");
    expect(moreIcons).toHaveLength(3);
  });

  it("renders dropdown menu items", () => {
    render(<NavProjects projects={defaultProjects} />);

    const viewProjectItems = screen.getAllByText("sidebar.viewProject");
    const shareItems = screen.getAllByText("sidebar.share");
    const deleteItems = screen.getAllByText("sidebar.delete");

    expect(viewProjectItems).toHaveLength(3);
    expect(shareItems).toHaveLength(3);
    expect(deleteItems).toHaveLength(3);
  });

  it("renders dropdown separators", () => {
    render(<NavProjects projects={defaultProjects} />);

    const separators = screen.getAllByTestId("dropdown-separator");
    expect(separators.length).toBeGreaterThan(0);
  });

  it("handles empty projects array", () => {
    render(<NavProjects projects={[]} />);

    expect(screen.getByTestId("sidebar-group")).toBeInTheDocument();
    expect(screen.getByText("sidebar.tokens")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies tooltip to project buttons", () => {
    render(<NavProjects projects={defaultProjects} />);

    const projectButton = screen.getByRole("button", {
      name: /Project Alpha/i,
    });
    expect(projectButton).toHaveAttribute("title", "Project Alpha");
  });

  it("hides dropdown on mobile", async () => {
    const { useSidebar } = await import("@kit/ui/sidebar");
    (useSidebar as ReturnType<typeof mock>).mockReturnValue({
      isMobile: true,
    });

    render(<NavProjects projects={defaultProjects} />);

    // Dropdown triggers should not be visible on mobile
    const dropdownTriggers = screen.queryAllByTestId("dropdown-trigger");
    expect(dropdownTriggers).toHaveLength(0);
  });

  it("shows dropdown on desktop", async () => {
    const { useSidebar } = await import("@kit/ui/sidebar");
    (useSidebar as ReturnType<typeof mock>).mockReturnValue({
      isMobile: false,
    });

    render(<NavProjects projects={defaultProjects} />);

    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    expect(dropdownTriggers).toHaveLength(3);
  });

  it("renders icons in dropdown menu items", () => {
    render(<NavProjects projects={defaultProjects} />);

    expect(screen.getAllByText("📁")).toHaveLength(3); // Folder icon
    expect(screen.getAllByText("➡️")).toHaveLength(3); // Forward icon
    expect(screen.getAllByText("🗑️")).toHaveLength(3); // Trash icon
  });

  it("structures menu items correctly", () => {
    const { container } = render(<NavProjects projects={defaultProjects} />);

    const menuItems = container.querySelectorAll("li");
    expect(menuItems).toHaveLength(3);
  });

  it("applies correct classes to more icon", () => {
    render(<NavProjects projects={defaultProjects} />);

    const moreIcons = screen.getAllByText("⋯");
    moreIcons.forEach((icon) => {
      expect(icon).toHaveClass("text-sidebar-foreground/70");
    });
  });

  it("renders SidebarMenuAction wrapper for dropdown", () => {
    const { container } = render(<NavProjects projects={defaultProjects} />);

    const menuActions = container.querySelectorAll("[showOnHover]");
    expect(menuActions.length).toBeGreaterThan(0);
  });
});
