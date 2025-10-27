import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatches } from "@tanstack/react-router";
import {
  ClipboardCheck,
  FileText,
  Key,
  Paintbrush,
  Puzzle,
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

  const roles = system.userPermissions?.roles ?? {};
  const canViewSettings =
    Object.keys(roles).length > 0 ||
    system.userPermissions?.roles.admin === true;

  if (!canViewSettings) {
    return null;
  }

  const settingsItems = [
    {
      name: t("settings.assetTypes.title"),
      icon: FileText,
      path: "/platform-settings/asset-types",
      enabled: true,
      disabledMessage: t("settings.assetTypes.notAuthorized"),
    },
    /* {
      name: t("settings.compliance.title"),
      icon: Shield,
      path: "/platform-settings/compliance",
      enabled: true,
      disabledMessage: t("settings.compliance.notAuthorized"),
    },*/
    {
      name: t("settings.addons.title"),
      icon: Puzzle,
      path: "/platform-settings/addons",
      enabled: true,
      disabledMessage: t("settings.addons.notAuthorized"),
    },
    {
      name: t("settings.theme.title"),
      icon: Paintbrush,
      path: "/platform-settings/theme",
      enabled: system.userPermissions?.roles.admin === true,
      disabledMessage: t("settings.theme.notAuthorized"),
    },
    {
      name: t("settings.claimTopicsIssuers.title"),
      icon: ClipboardCheck,
      path: "/platform-settings/claim-topics-issuers",
      enabled: true,
      disabledMessage: t("settings.claimTopicsIssuers.notAuthorized"),
    },
    {
      name: t("settings.permissions.title"),
      icon: Key,
      path: "/platform-settings/permissions",
      enabled: true,
      disabledMessage: t("settings.permissions.notAuthorized"),
    },
  ];

  if (settingsItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("platformSettings")}</SidebarGroupLabel>
      <SidebarMenu>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = isSettingsActive(item.path);

          const button = (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                disabled={!item.enabled}
              >
                <Link
                  to={item.path}
                  activeProps={{
                    "data-active": true,
                  }}
                  disabled={!item.enabled}
                  className={isActive ? "font-semibold" : undefined}
                >
                  <Icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (item.enabled) {
            return button;
          }

          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent className="whitespace-pre-wrap">
                {item.disabledMessage}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
