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
import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Navigation component for claim management in the sidebar.
 * Shows claim-related settings to users with claimPolicyManager or admin roles.
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
  const canViewCompliance = Boolean(roles?.claimPolicyManager || roles?.admin);

  if (!canViewCompliance) {
    return null;
  }

  const complianceItems: {
    name: string;
    icon: React.ElementType;
    path: string;
  }[] = [
    {
      name: t("settings.claimTopicsIssuers.title"),
      icon: ClipboardCheck,
      path: "/platform-settings/claim-topics-issuers",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("claimManagement")}</SidebarGroupLabel>
      <SidebarMenu>
        {complianceItems.map((item) => {
          const Icon = item.icon;
          const isActive = isComplianceActive(item.path);

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
