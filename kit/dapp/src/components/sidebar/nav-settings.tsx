import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useMatches } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  Key,
  Puzzle,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for platform settings in the sidebar.
 * Displays a list of platform configuration options.
 * @example
 * // Used within AppSidebar component
 * <NavSettings />
 */
export function NavSettings() {
  const { t } = useTranslation("navigation");
  const matches = useMatches();

  // Check if a specific settings route is active
  const isSettingsActive = (path: string) => {
    return matches.some((match) => match.pathname === path);
  };

  const settingsItems = [
    {
      name: t("settings.assetTypes.title"),
      icon: FileText,
      path: "/admin/platform-settings/asset-types",
    },
    {
      name: t("settings.compliance"),
      icon: Shield,
      path: "/admin/platform-settings/compliance",
    },
    {
      name: t("settings.addons"),
      icon: Puzzle,
      path: "/admin/platform-settings/addons",
    },
    {
      name: t("settings.claimTopicsIssuers"),
      icon: ClipboardCheck,
      path: "/admin/platform-settings/claim-topics-issuers",
    },
    {
      name: t("settings.permissions.title"),
      icon: Key,
      path: "/admin/platform-settings/permissions",
    },
  ];

  // Check if any settings route is active to highlight the parent
  const hasActiveChild = settingsItems.some((item) =>
    isSettingsActive(item.path)
  );

  const isUserManagementActive = isSettingsActive("/admin/user-management");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("administration")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              to="/admin/user-management"
              activeProps={{
                "data-active": true,
              }}
              className={isUserManagementActive ? "font-semibold" : ""}
            >
              <Users />
              <span>{t("userManagement")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible
          asChild
          defaultOpen={hasActiveChild}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={t("platformSettings")}
                className={hasActiveChild ? "font-semibold" : ""}
              >
                <Settings />
                <span>{t("platformSettings")}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {settingsItems.map((item) => {
                  const isActive = isSettingsActive(item.path);
                  return (
                    <SidebarMenuSubItem key={item.path}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={item.path}
                          activeProps={{
                            "data-active": true,
                          }}
                          className={isActive ? "font-semibold" : ""}
                        >
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
