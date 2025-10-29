import { Logo } from "@/components/logo/logo";
import { DEFAULT_THEME } from "@/components/theme/lib/schema";
import { useThemeAssets } from "@/components/theme/hooks/use-theme-assets";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

/**
 * Sidebar logo switches between full and icon variants with sidebar state.
 */
export function SidebarLogo() {
  const { logo } = useThemeAssets();
  const alt = logo.alt?.trim();
  const brandLabel =
    alt && alt.length > 0 ? alt : (DEFAULT_THEME.logo.alt ?? "SettleMint");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-4"
          asChild
        >
          <Link to="/" aria-label={brandLabel} title={brandLabel}>
            <Logo
              variant="horizontal"
              className="h-8 group-data-[collapsible=icon]:hidden"
            />
            <Logo
              variant="icon"
              className="hidden size-8 group-data-[collapsible=icon]:inline-flex"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
