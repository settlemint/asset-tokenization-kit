import { AssetDesignerButton } from "@/components/blocks/asset-designer/asset-designer-button";
import { NavHeader } from "@/components/layout/nav-header";
import { NavMode } from "@/components/layout/nav-mode";
import NavSidebar from "@/components/layout/nav-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AssetManagement } from "./items/asset-management";

export async function AssetsSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <AssetDesignerButton />
        <AssetManagement />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <NavMode />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
