import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

/**
 * Sidebar logo component that displays the SettleMint logo and app name.
 */
export function SidebarLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-4"
          asChild
        >
          <Link to="/">
            <AssetTokenizationKitLogo />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
