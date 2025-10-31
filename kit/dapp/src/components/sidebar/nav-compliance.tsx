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
import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for claim management in the sidebar.
 * Shows claim-related settings to users with claimPolicyManager or admin roles.
 * For admins, shows all items but disables those without required permissions.
 * @example
 * // Used within AppSidebar component
 * <NavCompliance />
 */
export function NavCompliance() {
  const { t } = useTranslation("navigation");
  const matches = useMatches();
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const isComplianceActive = (path: string) => {
    return matches.some((match) => match.pathname === path);
  };

  const roles = system.userPermissions?.roles;
  const isAdmin = roles?.admin === true;
  const canViewCompliance = Boolean(roles?.claimPolicyManager);

  // Show for admins or users with permission
  if (!isAdmin && !canViewCompliance) {
    return null;
  }

  const complianceItems: {
    name: string;
    icon: React.ElementType;
    path: string;
    disabled?: boolean;
    disabledMessage?: string;
  }[] = [
    {
      name: t("settings.claimTopicsIssuers.title"),
      icon: ClipboardCheck,
      path: "/platform-settings/claim-topics-issuers",
      disabled: isAdmin && !canViewCompliance,
      disabledMessage: t("settings.claimTopicsIssuers.notAuthorized"),
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("claimManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        {complianceItems.map((item) => {
          const Icon = item.icon;
          const isActive = isComplianceActive(item.path);

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

          if (item.disabled && item.disabledMessage) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent className="whitespace-pre-wrap">
                  {item.disabledMessage}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
