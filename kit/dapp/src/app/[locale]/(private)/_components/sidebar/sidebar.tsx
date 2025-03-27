import { RoleGuard } from "@/components/blocks/auth/role-guard";
import { DesignerButton } from "@/components/blocks/create-forms/designer-button";
import { NavHeader } from "@/components/layout/nav-header";
import NavSidebar from "@/components/layout/nav-sidebar";
import {
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { AssetManagement } from "./items/asset-management";
import { PlatformManagement } from "./items/platform-management";
import { PortfolioManagement } from "./items/portfolio-management";
import { SettingsManagement } from "./items/settings-management";

export async function PrivateSidebar() {
  const userDetails = await getCurrentUserDetail();
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <RoleGuard requiredRoles={["admin", "issuer"]}>
          <DesignerButton userDetails={userDetails} />
        </RoleGuard>
        <PortfolioManagement />
        <RoleGuard requiredRoles={["admin", "issuer"]}>
          <AssetManagement />
        </RoleGuard>
        <RoleGuard requiredRoles={["admin"]}>
          <PlatformManagement />
        </RoleGuard>
        <SettingsManagement />
      </SidebarContent>
      <SidebarRail />
    </NavSidebar>
  );
}
