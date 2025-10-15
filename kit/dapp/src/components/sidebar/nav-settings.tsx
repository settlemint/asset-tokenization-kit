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
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  Key,
  Puzzle,
  Settings,
  Shield,
  UserCheck,
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
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Check if a specific settings route is active
  const isSettingsActive = (path: string) => {
    return matches.some((match) => match.pathname === path);
  };

  const settingsItems = [
    {
      name: t("settings.assetTypes.title"),
      icon: FileText,
      path: "/admin/platform-settings/asset-types",
      enabled: system.userPermissions?.actions.tokenFactoryCreate,
    },
    {
      name: t("settings.compliance"),
      icon: Shield,
      path: "/admin/platform-settings/compliance",
      enabled: system.userPermissions?.actions.complianceModuleCreate,
    },
    {
      name: t("settings.addons"),
      icon: Puzzle,
      path: "/admin/platform-settings/addons",
      enabled: system.userPermissions?.actions.addonFactoryCreate,
    },
    {
      name: t("settings.claimTopicsIssuers"),
      icon: ClipboardCheck,
      path: "/admin/platform-settings/claim-topics-issuers",
      enabled:
        system.userPermissions?.actions.topicCreate ||
        system.userPermissions?.actions.trustedIssuerCreate,
    },
    {
      name: t("settings.permissions.title"),
      icon: Key,
      path: "/admin/platform-settings/permissions",
      enabled:
        system.userPermissions?.actions.grantRole ||
        system.userPermissions?.actions.revokeRole,
    },
    {
      name: t("settings.apiKeys.title"),
      icon: Key,
      path: "/admin/platform-settings/api-keys",
      enabled: Boolean(system.userPermissions?.roles.admin),
    },
  ].filter((item) => item.enabled);

  // Check if any settings route is active to highlight the parent
  const hasActiveChild = settingsItems.some((item) =>
    isSettingsActive(item.path)
  );

  const isUserManagementActive = isSettingsActive("/admin/user-management");
  const isIdentityManagementActive = isSettingsActive(
    "/admin/identity-management"
  );

  // Determine if there are any items to render under the administration group
  const hasAdministrationItems =
    Boolean(system.userPermissions?.actions.identityRegister) ||
    settingsItems.length > 0;

  if (!hasAdministrationItems) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("administration")}</SidebarGroupLabel>
      <SidebarMenu>
        {system.userPermissions?.actions.identityRegister && (
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
        )}

        {system.userPermissions?.actions.identityList && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/admin/identity-management"
                activeProps={{
                  "data-active": true,
                }}
                className={isIdentityManagementActive ? "font-semibold" : ""}
              >
                <UserCheck />
                <span>{t("identityManagement")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {settingsItems.length > 0 && (
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
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
