import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import {
  ClipboardCheck,
  FileText,
  Key,
  Paintbrush,
  Puzzle,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for platform settings in the sidebar.
 * Presents each configuration page as a top-level entry when the
 * corresponding permission is granted.
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
      path: "/platform-settings/asset-types",
      enabled: system.userPermissions?.actions.tokenFactoryCreate,
    },
    {
      name: t("settings.compliance"),
      icon: Shield,
      path: "/platform-settings/compliance",
      enabled: system.userPermissions?.actions.complianceModuleCreate,
    },
    {
      name: t("settings.addons"),
      icon: Puzzle,
      path: "/platform-settings/addons",
      enabled: system.userPermissions?.actions.addonFactoryCreate,
    },
    {
      name: t("settings.theme.title"),
      icon: Paintbrush,
      path: "/platform-settings/theme",
      enabled: system.userPermissions?.roles.admin === true,
    },
    {
      name: t("settings.claimTopicsIssuers"),
      icon: ClipboardCheck,
      path: "/platform-settings/claim-topics-issuers",
      enabled:
        system.userPermissions?.actions.topicCreate ||
        system.userPermissions?.actions.trustedIssuerCreate,
    },
    {
      name: t("settings.permissions.title"),
      icon: Key,
      path: "/platform-settings/permissions",
      enabled:
        system.userPermissions?.actions.grantRole ||
        system.userPermissions?.actions.revokeRole,
    },
  ].filter((item) => item.enabled);

  if (settingsItems.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{t("platformSettings")}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="px-2 py-1 text-sm text-muted-foreground">
              {t("settings.noAvailable")}
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("platformSettings")}</SidebarGroupLabel>
      <SidebarMenu>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = isSettingsActive(item.path);
          return (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link
                  to={item.path}
                  activeProps={{
                    "data-active": true,
                  }}
                  className={isActive ? "font-semibold" : undefined}
                >
                  <Icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
