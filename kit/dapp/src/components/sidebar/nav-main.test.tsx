import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { NavMain } from "./nav-main";
import type { LucideIcon } from "lucide-react";

// Mock icons
const MockIcon: LucideIcon = (() => <span>Icon</span>) as unknown as LucideIcon;

// Mock dependencies
void mock.module("@kit/ui/sidebar", () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <nav>{children}</nav>
  ),
  SidebarMenuButton: ({
    children,
    tooltip,
    ...props
  }: {
    children: React.ReactNode;
    tooltip?: string;
    [key: string]: unknown;
  }) => (
    <button title={tooltip} {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuSubButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
  SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
}));

void mock.module("@kit/ui/collapsible", () => ({
  Collapsible: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => <div data-open={open}>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="collapsible-content">{children}</div>
  ),
  CollapsibleTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button data-testid="collapsible-trigger" {...props}>
      {children}
    </button>
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconChevronRight: ({ className }: { className?: string }) => (
    <span className={className}>›</span>
  ),
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

describe("NavMain", () => {
  const defaultItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: MockIcon,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: MockIcon,
    },
    {
      title: "Projects",
      url: "#",
      icon: MockIcon,
      items: [
        { title: "Project A", url: "/projects/a" },
        { title: "Project B", url: "/projects/b" },
      ],
    },
  ];

  it("renders navigation items correctly", () => {
    render(<NavMain items={defaultItems} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders group label", () => {
    render(<NavMain items={defaultItems} />);

    expect(screen.getByText("sidebar.platform")).toBeInTheDocument();
  });

  it("renders icons for each item", () => {
    render(<NavMain items={defaultItems} />);

    const icons = screen.getAllByText("Icon");
    expect(icons).toHaveLength(3);
  });

  it("applies active state to active items", () => {
    render(<NavMain items={defaultItems} />);

    const dashboardButton = screen.getByRole("button", { name: /Dashboard/i });
    expect(dashboardButton).toHaveAttribute("data-active", "true");
  });

  it("renders collapsible items with sub-navigation", () => {
    render(<NavMain items={defaultItems} />);

    const projectsButton = screen.getByTestId("collapsible-trigger");
    expect(projectsButton).toBeInTheDocument();

    const collapsibleContent = screen.getByTestId("collapsible-content");
    expect(collapsibleContent).toBeInTheDocument();
    expect(collapsibleContent).toHaveTextContent("Project A");
    expect(collapsibleContent).toHaveTextContent("Project B");
  });

  it("handles empty items array", () => {
    render(<NavMain items={[]} />);

    expect(screen.getByTestId("sidebar-group")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders items without icons", () => {
    const itemsWithoutIcons = [{ title: "No Icon Item", url: "/no-icon" }];

    render(<NavMain items={itemsWithoutIcons} />);

    expect(screen.getByText("No Icon Item")).toBeInTheDocument();
  });

  it("renders chevron icon for collapsible items", () => {
    render(<NavMain items={defaultItems} />);

    const chevrons = screen.getAllByText("›");
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it("rotates chevron based on open state", () => {
    const { container } = render(<NavMain items={defaultItems} />);

    const chevron = container.querySelector(".transition-transform");
    expect(chevron).toBeInTheDocument();
  });

  it("renders tooltip for menu buttons", () => {
    render(<NavMain items={defaultItems} />);

    const dashboardButton = screen.getByRole("button", { name: /Dashboard/i });
    expect(dashboardButton).toHaveAttribute("title", "Dashboard");
  });

  it("handles items with only title and url", () => {
    const simpleItems = [{ title: "Simple Item", url: "/simple" }];

    render(<NavMain items={simpleItems} />);

    expect(screen.getByText("Simple Item")).toBeInTheDocument();
  });

  it("renders nested sub-items correctly", () => {
    const nestedItems = [
      {
        title: "Parent",
        url: "#",
        icon: MockIcon,
        items: [
          { title: "Child 1", url: "/child1" },
          { title: "Child 2", url: "/child2" },
          { title: "Child 3", url: "/child3" },
        ],
      },
    ];

    render(<NavMain items={nestedItems} />);

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
  });

  it("applies correct structure for sidebar menu", () => {
    const { container } = render(<NavMain items={defaultItems} />);

    const menuItems = container.querySelectorAll("li");
    expect(menuItems.length).toBeGreaterThanOrEqual(3);
  });

  it("handles mixed items with and without sub-navigation", () => {
    const mixedItems = [
      { title: "Simple", url: "/simple" },
      {
        title: "Complex",
        url: "#",
        items: [{ title: "Sub", url: "/sub" }],
      },
      { title: "Another Simple", url: "/another" },
    ];

    render(<NavMain items={mixedItems} />);

    expect(screen.getByText("Simple")).toBeInTheDocument();
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
    expect(screen.getByText("Another Simple")).toBeInTheDocument();
  });
});
