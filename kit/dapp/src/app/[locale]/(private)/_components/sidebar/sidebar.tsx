"use client";

import { RoleGuard } from "@/components/blocks/auth/role-guard";
import { DesignerButton } from "@/components/blocks/create-forms/designer-button";
import { NavHeader } from "@/components/layout/nav-header";
import NavSidebar from "@/components/layout/nav-sidebar";
import {
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/routing";
import { AssetManagement } from "./items/asset-management";
import { PlatformManagement } from "./items/platform-management";
import { PortfolioManagement } from "./items/portfolio-management";

export function PrivateSidebar() {
  const pathname = usePathname();
  const isSettingsView = pathname.startsWith("/portfolio/settings");

  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        {!isSettingsView && (
          <RoleGuard requiredRoles={["admin", "issuer"]}>
            <DesignerButton />
          </RoleGuard>
        )}
        <PortfolioManagement />
        {!isSettingsView && (
          <>
            <RoleGuard requiredRoles={["admin", "issuer"]}>
              <AssetManagement />
            </RoleGuard>
            <RoleGuard requiredRoles={["admin"]}>
              <PlatformManagement />
            </RoleGuard>
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </NavSidebar>
  );
}
