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
 * Shows for admins or users with claimPolicyManager role.
 * For admins: shows all items, disables Claim Topics & Issuers if no claimPolicyManager role.
 * For non-admins with claimPolicyManager: only shows Claim Topics & Issuers.
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

  const roles = system.userPermissions?.roles;
  const isAdmin = roles?.admin === true;
  const canManageClaims = Boolean(roles?.claimPolicyManager);

  // Show for admins or users with claimPolicyManager role
  if (!isAdmin && !canManageClaims) {
    return null;
  }

  // Build settings items based on role
  const settingsItems: {
    name: string;
    icon: React.ElementType;
    path: string;
    disabled?: boolean;
    disabledMessage?: string;
  }[] = [];

  // For non-admin users with claimPolicyManager, only show Claim Topics & Issuers
  if (!isAdmin && canManageClaims) {
    settingsItems.push({
      name: t("settings.claimTopicsIssuers.title"),
      icon: ClipboardCheck,
      path: "/platform-settings/claim-topics-issuers",
    });
  }

  // For admins, show all items
  if (isAdmin) {
    settingsItems.push(
      {
        name: t("settings.assetTypes.title"),
        icon: FileText,
        path: "/platform-settings/asset-types",
      },
      {
        name: t("settings.addons.title"),
        icon: Puzzle,
        path: "/platform-settings/addons",
      },
      {
        name: t("settings.claimTopicsIssuers.title"),
        icon: ClipboardCheck,
        path: "/platform-settings/claim-topics-issuers",
        disabled: !canManageClaims,
        disabledMessage: t("settings.claimTopicsIssuers.notAuthorized"),
      },
      {
        name: t("settings.theme.title"),
        icon: Paintbrush,
        path: "/platform-settings/theme",
      },
      {
        name: t("settings.permissions.title"),
        icon: Key,
        path: "/platform-settings/permissions",
      }
    );
  }

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
                  <>
                    <Icon className="size-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.name}
                    </span>
                  </>
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
              <TooltipContent side="right" className="whitespace-pre-wrap">
                {item.disabledMessage}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
