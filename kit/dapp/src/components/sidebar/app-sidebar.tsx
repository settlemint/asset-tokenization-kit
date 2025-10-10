import { NavAddons } from "@/components/sidebar/nav-addons";
import { NavAsset } from "@/components/sidebar/nav-asset";
import { NavMyAssets } from "@/components/sidebar/nav-my-assets";
import { NavSettings } from "@/components/sidebar/nav-settings";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, HomeIcon } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

/**
 * The main application sidebar component.
 * @param {React.ComponentProps<typeof Sidebar>} props - The props for the Sidebar component.
 * @returns {JSX.Element} A sidebar component with header, navigation, and rail.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("navigation");
  const isHomeActive = useRouterState({
    select: (state) => state.location.pathname === "/",
  });
  const isActionsActive = useRouterState({
    select: (state) => state.location.pathname.startsWith("/actions"),
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isHomeActive}>
                <Link
                  to="/"
                  aria-current={isHomeActive ? "page" : undefined}
                  className={isHomeActive ? "font-semibold" : undefined}
                >
                  <HomeIcon />
                  <span>{t("home")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActionsActive}>
                <Link
                  to="/actions"
                  aria-current={isActionsActive ? "page" : undefined}
                  className={isActionsActive ? "font-semibold" : undefined}
                >
                  <ClipboardList />
                  <span>{t("actions")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMyAssets />
        <NavAsset />
        <NavAddons />
        <NavSettings />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
