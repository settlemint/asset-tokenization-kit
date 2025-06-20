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
import { PlatformManagement } from "./items/platform-management";

export async function PlatformSidebar() {
  return (
    <NavSidebar>
      <SidebarHeader className="h-16">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <PlatformManagement />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <NavMode />
      </SidebarFooter>
      <SidebarRail />
    </NavSidebar>
  );
}
