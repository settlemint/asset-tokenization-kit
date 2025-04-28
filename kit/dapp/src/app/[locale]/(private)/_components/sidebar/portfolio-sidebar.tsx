import { RoleGuard } from "@/components/blocks/auth/role-guard";
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
import { PortfolioManagement } from "./items/portfolio-management";
import { TradeManagement } from "./items/trade-management";

export async function PortfolioSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <PortfolioManagement />
        <TradeManagement />
      </SidebarContent>
      <RoleGuard requiredRoles={["admin", "issuer"]}>
        <SidebarFooter>
          <Separator />
          <NavMode />
        </SidebarFooter>
      </RoleGuard>
      <SidebarRail />
    </NavSidebar>
  );
}
