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
import { getUser } from "@/lib/auth/utils";
import { AssetManagement } from "./items/asset-management";
import { CustodyManagement } from "./items/custody-management";

export async function AssetsSidebar() {
  const user = await getUser();

  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <AssetDesignerButton currentUser={user} />
        <AssetManagement />
        <CustodyManagement />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <NavMode />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
