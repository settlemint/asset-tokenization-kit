import { NavFooter } from "@/components/layout/nav-footer";
import { NavHeader } from "@/components/layout/nav-header";
import { NavMain } from "@/components/layout/nav-main";
import NavSidebar from "@/components/layout/nav-sidebar";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DesignerButton } from "./designer-button";
import { AssetManagement } from "./items/asset-management/asset-management";
import { bottomItems } from "./items/bottom";
import { topItems } from "./items/top";

export function AdminSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <DesignerButton />
        <NavMain items={topItems} />
        <AssetManagement />
        <NavMain items={bottomItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
