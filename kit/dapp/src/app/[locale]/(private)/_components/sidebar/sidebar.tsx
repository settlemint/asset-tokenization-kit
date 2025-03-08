import { NavHeader } from "@/components/layout/nav-header";
import NavSidebar from "@/components/layout/nav-sidebar";
import {
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DesignerButton } from "./designer-button";
import { AssetManagement } from "./items/asset-management";
import { PlatformManagement } from "./items/platform-management";
import { PortfolioManagement } from "./items/portfolio-management";

export function AdminSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <DesignerButton />
        <PortfolioManagement />
        <AssetManagement />
        <PlatformManagement />
      </SidebarContent>
      <SidebarRail />
    </NavSidebar>
  );
}
