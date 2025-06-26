import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "./app-sidebar";

// Mock dependencies
void mock.module("@kit/ui/sidebar", () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <aside data-testid="sidebar" {...props}>
      {children}
    </aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  SidebarMenuButton: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

void mock.module("./nav-main", () => ({
  NavMain: ({ items }: { items: { title: string; url?: string; icon?: React.ComponentType; items?: { title: string; url: string }[] }[] }) => (
    <div data-testid="nav-main">
      {items.map((item) => (
        <div key={item.title}>{item.title}</div>
      ))}
    </div>
  ),
}));

void mock.module("./nav-projects", () => ({
  NavProjects: ({ projects }: { projects: { name: string; url: string; icon: React.ComponentType }[] }) => (
    <div data-testid="nav-projects">
      {projects.map((project) => (
        <div key={project.name}>{project.name}</div>
      ))}
    </div>
  ),
}));

void mock.module("./sidebar-logo", () => ({
  SidebarLogo: () => <div data-testid="sidebar-logo">Logo</div>,
}));

void mock.module("@kit/ui/icon", () => ({
  IconBadgeDollarSign: () => <span>💰</span>,
  IconBuilding: () => <span>🏢</span>,
  IconDashboard: () => <span>📊</span>,
  IconFileText: () => <span>📄</span>,
  IconSettings: () => <span>⚙️</span>,
  IconWallet: () => <span>👛</span>,
  IconChartLine: () => <span>📈</span>,
  IconCoins: () => <span>🪙</span>,
  IconCode: () => <span>💻</span>,
  IconUsers: () => <span>👥</span>,
  IconHome: () => <span>🏠</span>,
  IconUserPen: () => <span>✏️</span>,
}));

describe("AppSidebar", () => {
  it("renders sidebar structure correctly", () => {
    render(<AppSidebar />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-logo")).toBeInTheDocument();
    expect(screen.getByTestId("nav-main")).toBeInTheDocument();
    expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
  });

  it("renders main navigation items", () => {
    render(<AppSidebar />);

    const navMain = screen.getByTestId("nav-main");
    expect(navMain).toHaveTextContent("sidebar.dashboard");
    expect(navMain).toHaveTextContent("sidebar.digitalAssets");
    expect(navMain).toHaveTextContent("sidebar.settings");
  });

  it("renders project navigation items", () => {
    render(<AppSidebar />);

    const navProjects = screen.getByTestId("nav-projects");
    expect(navProjects).toHaveTextContent("sidebar.bonds");
    expect(navProjects).toHaveTextContent("sidebar.equity");
    expect(navProjects).toHaveTextContent("sidebar.fund");
    expect(navProjects).toHaveTextContent("sidebar.stablecoin");
    expect(navProjects).toHaveTextContent("sidebar.deposit");
  });

  it("renders user menu in footer", () => {
    render(<AppSidebar />);

    expect(screen.getByText("sidebar.users")).toBeInTheDocument();
    expect(screen.getByText("✏️")).toBeInTheDocument(); // User icon
  });

  it("passes correct props to NavMain", () => {
    const NavMain = mock(({ items }: { items: { title: string; url?: string; icon?: React.ComponentType; items?: { title: string; url: string }[] }[] }) => {
      // Verify items structure
      expect(items).toHaveLength(3);
      expect(items[0]).toMatchObject({
        title: "sidebar.dashboard",
        url: "/dashboard",
        icon: expect.any(Function),
      });
      expect(items[1]).toMatchObject({
        title: "sidebar.digitalAssets",
        url: "#",
        icon: expect.any(Function),
        items: expect.arrayContaining([
          { title: "sidebar.myAssets", url: "/assets" },
          { title: "sidebar.tokenization", url: "/tokenization" },
          { title: "sidebar.transactions", url: "/transactions" },
        ]),
      });
      expect(items[2]).toMatchObject({
        title: "sidebar.settings",
        url: "/settings",
        icon: expect.any(Function),
      });
      return null;
    });

    void mock.module("./nav-main", () => ({ NavMain }));

    render(<AppSidebar />);
  });

  it("passes correct props to NavProjects", () => {
    const NavProjects = mock(({ projects }: { projects: { name: string; url: string; icon: React.ComponentType }[] }) => {
      // Verify projects structure
      expect(projects).toHaveLength(5);
      expect(projects[0]).toMatchObject({
        name: "sidebar.bonds",
        url: "/bonds",
        icon: expect.any(Function),
      });
      expect(projects[1]).toMatchObject({
        name: "sidebar.equity",
        url: "/equity",
        icon: expect.any(Function),
      });
      expect(projects[2]).toMatchObject({
        name: "sidebar.fund",
        url: "/fund",
        icon: expect.any(Function),
      });
      expect(projects[3]).toMatchObject({
        name: "sidebar.stablecoin",
        url: "/stablecoin",
        icon: expect.any(Function),
      });
      expect(projects[4]).toMatchObject({
        name: "sidebar.deposit",
        url: "/deposit",
        icon: expect.any(Function),
      });
      return null;
    });

    void mock.module("./nav-projects", () => ({ NavProjects }));

    render(<AppSidebar />);
  });

  it("applies correct sidebar props", () => {
    render(<AppSidebar className="custom-sidebar" />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveClass("custom-sidebar");
  });

  it("renders all sidebar sections in correct order", () => {
    const { container } = render(<AppSidebar />);

    const sections = container.querySelectorAll("header, nav, footer");
    expect(sections).toHaveLength(3);

    // Header should contain logo
    expect(
      sections[0].querySelector('[data-testid="sidebar-logo"]')
    ).toBeInTheDocument();

    // Nav should contain main navigation
    expect(
      sections[1].querySelector('[data-testid="nav-main"]')
    ).toBeInTheDocument();

    // Footer should contain user menu
    expect(sections[2]).toHaveTextContent("sidebar.users");
  });

  it("spreads additional props to Sidebar component", () => {
    const extraProps = {
      "data-custom": "value",
      id: "main-sidebar",
    };

    render(<AppSidebar {...extraProps} />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-custom", "value");
    expect(sidebar).toHaveAttribute("id", "main-sidebar");
  });
});
