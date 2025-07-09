import { NavAsset } from "@/components/sidebar/nav-asset";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import * as React from "react";

/**
 * The main application sidebar component.
 * @param {React.ComponentProps<typeof Sidebar>} props - The props for the Sidebar component.
 * @returns {JSX.Element} A sidebar component with header, navigation, and rail.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavAsset />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
