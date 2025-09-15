import { NavAddons } from "@/components/sidebar/nav-addons";
import { NavAsset } from "@/components/sidebar/nav-asset";
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
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

/**
 * The main application sidebar component.
 * @param {React.ComponentProps<typeof Sidebar>} props - The props for the Sidebar component.
 * @returns {JSX.Element} A sidebar component with header, navigation, and rail.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("navigation");
  const navigate = useNavigate();
  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

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
                onClick={() => {
                  void navigate({
                    to: "/",
                  });
                }}
              >
                <HomeIcon />
                <span>{t("home")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {system?.userPermissions?.actions.tokenCreate && <NavAsset />}
        {system?.userPermissions?.actions.addonCreate && <NavAddons />}
        <NavSettings />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
