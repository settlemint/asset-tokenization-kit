import { NavAddons } from "@/components/sidebar/nav-addons";
import { NavAsset } from "@/components/sidebar/nav-asset";
import { NavMyAssets } from "@/components/sidebar/nav-my-assets";
import { NavParticipants } from "@/components/sidebar/nav-participants";
import { NavSettings } from "@/components/sidebar/nav-settings";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, HomeIcon } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

/**
 * The main application sidebar component with navigation and pending action badge.
 * @param {React.ComponentProps<typeof Sidebar>} props - The props for the Sidebar component.
 * @returns {JSX.Element} A sidebar component with header, navigation, and rail.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("navigation");
  const { t: tActions } = useTranslation("actions");
  const isHomeActive = useRouterState({
    select: (state) => state.location.pathname === "/",
  });
  const isActionsActive = useRouterState({
    select: (state) => state.location.pathname.startsWith("/actions"),
  });
  const { data: actions } = useSuspenseQuery(
    orpc.actions.list.queryOptions({
      input: {
        status: "PENDING",
      },
    })
  );
  const pendingCount = actions.length;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isHomeActive}
                tooltip={t("home")}
              >
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
              <SidebarMenuButton
                asChild
                isActive={isActionsActive}
                tooltip={t("actions")}
              >
                <Link
                  to="/actions"
                  aria-current={isActionsActive ? "page" : undefined}
                  className={isActionsActive ? "font-semibold" : undefined}
                >
                  <ClipboardList />
                  <span>{t("actions")}</span>
                </Link>
              </SidebarMenuButton>
              {pendingCount > 0 ? (
                <SidebarMenuBadge
                  aria-label={`${pendingCount} ${tActions("tabs.pending")} ${t(
                    "actions"
                  )}`}
                  className="bg-secondary text-secondary-foreground border border-transparent"
                >
                  {pendingCount}
                </SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMyAssets />
        <NavAsset />
        <NavAddons />
        <NavParticipants />
        <NavSettings />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
