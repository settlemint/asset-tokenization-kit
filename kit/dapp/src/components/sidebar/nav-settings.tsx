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
import { FileText, Key, Paintbrush, Puzzle } from "lucide-react";
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

  const canViewSettings = system.userPermissions?.roles.admin === true;

  if (!canViewSettings) {
    return null;
  }

  const settingsItems: {
    name: string;
    icon: React.ElementType;
    path: string;
    disabled?: boolean;
    disabledMessage?: string;
  }[] = [
    {
      name: t("settings.assetTypes.title"),
      icon: FileText,
      path: "/platform-settings/asset-types",
    },
    /* {
      name: t("settings.compliance.title"),
      icon: Shield,
      path: "/platform-settings/compliance",
      disabledMessage: t("settings.compliance.notAuthorized"),
    },*/
    {
      name: t("settings.addons.title"),
      icon: Puzzle,
      path: "/platform-settings/addons",
    },
    {
      name: t("settings.theme.title"),
      icon: Paintbrush,
      path: "/platform-settings/theme",
      disabled: system.userPermissions?.roles.admin !== true,
      disabledMessage: t("settings.theme.notAuthorized"),
    },
    {
      name: t("settings.permissions.title"),
      icon: Key,
      path: "/platform-settings/permissions",
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
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild={!item.disabled}
                isActive={isActive}
                disabled={item.disabled}
                tooltip={item.disabled ? undefined : item.name}
              >
                {item.disabled ? (
                  <div className="flex items-center gap-2">
                    <Icon />
                    <span>{item.name}</span>
                  </div>
                ) : (
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
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (!item.disabled || !item.disabledMessage) {
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
